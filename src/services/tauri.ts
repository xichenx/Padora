import { invoke } from "@tauri-apps/api/core";
import type { FileNode, SearchResult } from "../types";

export async function readFile(path: string): Promise<string> {
  return invoke<string>("read_file", { path });
}

export async function writeFile(path: string, content: string): Promise<void> {
  return invoke("write_file", { path, content });
}

export async function getFileName(path: string): Promise<string> {
  return invoke<string>("file_name", { path });
}

export async function scanDir(path: string): Promise<FileNode> {
  return invoke<FileNode>("scan_dir", { path });
}

export async function searchDir(
  root: string,
  query: string,
): Promise<SearchResult[]> {
  return invoke<SearchResult[]>("search_dir", { root, query });
}

export async function createMarkdown(
  dir: string,
  name: string,
): Promise<string> {
  return invoke<string>("create_markdown", { dir, name });
}

export async function renamePath(
  path: string,
  newName: string,
): Promise<string> {
  return invoke<string>("rename_path", { path, newName });
}

export async function deletePath(path: string): Promise<void> {
  return invoke("delete_path", { path });
}

export async function importImage(
  src: string,
  mdPath: string,
): Promise<string> {
  return invoke<string>("import_image", { src, mdPath });
}

export async function saveImageBytes(
  data: number[],
  ext: string,
  mdPath: string,
): Promise<string> {
  return invoke<string>("save_image_bytes", { data, ext, mdPath });
}

export async function rebuildMenu(lang: string): Promise<void> {
  return invoke("rebuild_menu", { lang });
}
