pub fn verify_code(code: &str) -> Result<(), String> {
    let forbidden = [
        "std::fs",
        "std::io",
        "std::path",
        "std::env",
        "std::net",
        "std::socket",
        "std::process",
        "std::thread",
        "std::sync",
        "Command::new",
        "std::ffi",
        "std::os",
        "libc",
        "winapi",
        "std::ptr",
        "std::mem",
        "std::intrinsics",
        "std::time::Instant",
        "std::time::SystemTime",
        "std::alloc",
        "include_str!",
        "include_bytes!",
        "include!",
        "unsafe",
    ];

    for word in forbidden {
        if code.contains(word) {
            eprintln!(
                "LOG: Código rejeitado por conter palavra proibida: {}",
                word
            );
            return Err(format!("Segurança: O uso de '{}' não é permitido.", word));
        }
    }
    Ok(())
}
