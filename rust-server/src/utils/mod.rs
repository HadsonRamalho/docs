use std::time::{Duration, SystemTime};

const ONE_SECOND: u64 = 1000;
const ONE_MINUTE: u64 = 60 * ONE_SECOND;

pub fn extract_module_name(code: &str) -> Option<String> {
    for line in code.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("//#[mod=") && trimmed.ends_with("]") {
            let name = trimmed.trim_start_matches("//#[mod=").trim_end_matches("]");

            if name.chars().all(|c| c.is_alphanumeric() || c == '_') {
                return Some(name.to_string());
            }
        }
    }
    None
}

pub async fn auto_delete_files() {
    let mins = ONE_MINUTE * 20;
    let intervalo_verificacao = Duration::from_millis(mins);
    let tempo_maximo_vida = Duration::from_millis(mins);

    println!("LOG: Iniciando tarefa de limpeza automática");

    loop {
        tokio::time::sleep(intervalo_verificacao).await;

        println!("LOG: [GC] Iniciando varredura de limpeza...");

        let mut entradas = match tokio::fs::read_dir("files").await {
            Ok(e) => e,
            Err(_) => continue,
        };

        while let Ok(Some(entry)) = entradas.next_entry().await {
            let path = entry.path();

            if path.is_dir() {
                if let Ok(metadata) = tokio::fs::metadata(&path).await {
                    if let Ok(modified) = metadata.modified() {
                        if let Ok(idade) = SystemTime::now().duration_since(modified) {
                            if idade > tempo_maximo_vida {
                                println!("LOG: [GC] Removendo pasta antiga: {:?}", path);
                                if let Err(e) = tokio::fs::remove_dir_all(&path).await {
                                    eprintln!("ERRO: [GC] Falha ao deletar {:?}: {}", path, e);
                                }
                            }
                        }
                    }
                }
            }
        }
        println!("LOG: [GC] Varredura finalizada.");
    }
}
