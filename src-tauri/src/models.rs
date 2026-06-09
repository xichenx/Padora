use serde::Serialize;

/// A node in the markdown file tree shown in the sidebar.
#[derive(Serialize)]
pub struct FileNode {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub children: Vec<FileNode>,
}

/// A single matched line within a file.
#[derive(Serialize)]
pub struct SearchMatch {
    pub line: usize,
    pub text: String,
}

/// Search results grouped per file.
#[derive(Serialize)]
pub struct SearchResult {
    pub name: String,
    pub path: String,
    pub matches: Vec<SearchMatch>,
}
