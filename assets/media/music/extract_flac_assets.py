#!/usr/bin/env python3
"""Add a FLAC file to the local music player.

Examples:
  python assets/media/music/extract_flac_assets.py "assets/media/music/music/new-song.flac"
  python assets/media/music/extract_flac_assets.py "assets/media/music/music/new-song.flac" --mode 1

Modes:
  0: Extract lyrics and cover art, keep the FLAC file (default).
  1: Convert to 320 kbps MP3, then remove the FLAC file.
  2: Convert to 256 kbps AAC in an M4A container, then remove the FLAC file.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess


IMAGE_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
MUSIC_ROOT = Path(__file__).resolve().parent
ENCODERS = {
    1: (".mp3", ["-c:a", "libmp3lame", "-b:a", "320k"]),
    2: (".m4a", ["-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart"]),
}


def read_u32_le(data: bytes, offset: int) -> int:
    return int.from_bytes(data[offset : offset + 4], "little")


def read_u32_be(data: bytes, offset: int) -> int:
    return int.from_bytes(data[offset : offset + 4], "big")


def parse_vorbis_comments(block: bytes) -> dict[str, list[str]]:
    offset = 0
    vendor_length = read_u32_le(block, offset)
    offset += 4 + vendor_length
    comment_count = read_u32_le(block, offset)
    offset += 4
    comments: dict[str, list[str]] = {}

    for _ in range(comment_count):
        entry_length = read_u32_le(block, offset)
        offset += 4
        entry = block[offset : offset + entry_length].decode("utf-8", errors="replace")
        offset += entry_length
        key, separator, value = entry.partition("=")
        if separator:
            comments.setdefault(key.upper(), []).append(value)

    return comments


def parse_picture(block: bytes) -> tuple[int, str, bytes]:
    offset = 0
    picture_type = read_u32_be(block, offset)
    offset += 4
    mime_length = read_u32_be(block, offset)
    offset += 4
    mime = block[offset : offset + mime_length].decode("ascii", errors="replace")
    offset += mime_length
    description_length = read_u32_be(block, offset)
    offset += 4 + description_length
    offset += 16  # Width, height, color depth, and indexed color count.
    image_length = read_u32_be(block, offset)
    offset += 4
    return picture_type, mime, block[offset : offset + image_length]


def extract_metadata(source: Path) -> tuple[dict[str, list[str]], tuple[int, str, bytes] | None]:
    with source.open("rb") as flac_file:
        if flac_file.read(4) != b"fLaC":
            raise ValueError(f"{source} is not a FLAC file")

        comments: dict[str, list[str]] = {}
        pictures: list[tuple[int, str, bytes]] = []
        is_last_block = False

        while not is_last_block:
            header = flac_file.read(4)
            if len(header) != 4:
                raise ValueError("Unexpected end of FLAC metadata")
            is_last_block = bool(header[0] & 0x80)
            block_type = header[0] & 0x7F
            block_length = int.from_bytes(header[1:], "big")
            block = flac_file.read(block_length)
            if len(block) != block_length:
                raise ValueError("Unexpected end of FLAC metadata block")
            if block_type == 4:
                comments = parse_vorbis_comments(block)
            elif block_type == 6:
                pictures.append(parse_picture(block))

    front_cover = next((picture for picture in pictures if picture[0] == 3), None)
    return comments, front_cover or (pictures[0] if pictures else None)


def site_path(path: Path) -> str:
    """Return the root-relative URL path used by the static site."""
    for parent in (path, *path.parents):
        if parent.name == "assets":
            return path.resolve().relative_to(parent.parent.resolve()).as_posix()
    raise ValueError(f"{path} is not inside the site's assets directory")


def update_playlist(playlist_path: Path, track: dict[str, str], source_audio: str) -> str:
    if playlist_path.exists():
        playlist_data = json.loads(playlist_path.read_text(encoding="utf-8"))
    else:
        playlist_data = {"tracks": []}

    tracks = playlist_data.setdefault("tracks", [])
    replaced_audio_paths = {source_audio, track["audio"]}
    updated_tracks = []
    was_updated = False
    for existing_track in tracks:
        if existing_track.get("audio") not in replaced_audio_paths:
            updated_tracks.append(existing_track)
        elif not was_updated:
            updated_tracks.append(track)
            was_updated = True
    if not was_updated:
        updated_tracks.append(track)
    playlist_data["tracks"] = updated_tracks
    result = "updated" if was_updated else "added"

    playlist_path.write_text(
        json.dumps(playlist_data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return result


def find_ffmpeg() -> str | None:
    for executable in ("ffmpeg", "ffmpeg.exe"):
        command = shutil.which(executable)
        if command:
            return command

    local_app_data = os.environ.get("LOCALAPPDATA")
    if local_app_data:
        package_root = Path(local_app_data) / "Microsoft" / "WinGet" / "Packages"
        installed = sorted(package_root.glob("Gyan.FFmpeg.*/*/bin/ffmpeg.exe"))
        if installed:
            return str(installed[-1])
    return None


def convert_audio(source: Path, mode: int) -> Path:
    extension, encoder_options = ENCODERS[mode]
    target = source.with_suffix(extension)
    if target.exists():
        raise FileExistsError(f"Target already exists: {target}")

    ffmpeg = find_ffmpeg()
    if not ffmpeg:
        raise RuntimeError("ffmpeg was not found. Install it and open a new PowerShell window.")

    command = [
        ffmpeg,
        "-hide_banner",
        "-loglevel",
        "warning",
        "-i",
        str(source),
        "-map",
        "0:a:0",
        "-vn",
        *encoder_options,
        str(target),
    ]
    print(f"Converting: {source.name} -> {target.name}")
    subprocess.run(command, check=True)
    return target


def write_assets(source: Path, output_dir: Path, name: str, playlist_path: Path, mode: int) -> None:
    comments, picture = extract_metadata(source)
    lyrics = (comments.get("LYRICS") or comments.get("UNSYNCEDLYRICS") or [None])[0]
    title = (comments.get("TITLE") or [source.stem])[0]
    artist = (comments.get("ARTIST") or ["未知艺术家"])[0]
    source_audio = site_path(source)
    audio_path = convert_audio(source, mode) if mode else source
    track = {"title": title, "artist": artist, "audio": site_path(audio_path)}

    print(f"Title: {title}")
    print(f"Artist: {artist}")

    if lyrics:
        lyrics_path = output_dir / "lyrics" / f"{name}.lrc"
        lyrics_path.parent.mkdir(parents=True, exist_ok=True)
        lyrics_path.write_text(lyrics.lstrip("\ufeff"), encoding="utf-8")
        track["lrc"] = site_path(lyrics_path)
        print(f"Lyrics: {lyrics_path.as_posix()}")
    else:
        print("Lyrics: not embedded")

    if picture:
        _, mime, image_data = picture
        extension = IMAGE_EXTENSIONS.get(mime.lower(), ".jpg")
        cover_path = output_dir / "covers" / f"{name}{extension}"
        cover_path.parent.mkdir(parents=True, exist_ok=True)
        cover_path.write_bytes(image_data)
        track["cover"] = site_path(cover_path)
        print(f"Cover: {cover_path.as_posix()}")
    else:
        print("Cover: not embedded")

    result = update_playlist(playlist_path, track, source_audio)
    print(f"Playlist: {result} {playlist_path.as_posix()}")
    if mode:
        source.unlink()
        print(f"Removed source: {source.as_posix()}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Add a FLAC file to the local music player.")
    parser.add_argument("source", type=Path, help="Path to a FLAC file")
    parser.add_argument(
        "--mode",
        type=int,
        choices=(0, 1, 2),
        default=0,
        help="0: extract only; 1: MP3 and remove FLAC; 2: AAC/M4A and remove FLAC",
    )
    parser.add_argument("--name", help="Output filename without extension; defaults to the FLAC filename")
    parser.add_argument(
        "--playlist",
        type=Path,
        help="Playlist JSON path; defaults to playlist.json beside this script",
    )
    args = parser.parse_args()

    source = args.source.resolve()
    if not source.is_file():
        parser.error(f"File not found: {source}")
    playlist_path = (args.playlist or MUSIC_ROOT / "playlist.json").resolve()
    write_assets(source, MUSIC_ROOT, args.name or source.stem, playlist_path, args.mode)


if __name__ == "__main__":
    main()
