//! The five-line Vaerion experience, in Rust.
//!
//! Run: `cargo run --example basic` (needs a vae runtime: `$VAE_BIN`, `vae`
//! on PATH, or the repo fallback via `bun`).
//!
//! The example creates an isolated temporary workspace, spawns its own
//! loopback daemon, runs one brokered agent goal with the declared inline
//! note plan, prints the run coordinates and integrity commitment, then
//! verifies the journal chain through the CLI of record.

use std::time::{SystemTime, UNIX_EPOCH};
use vaerion::Agent;

fn main() {
    if let Err(err) = main_result() {
        eprintln!("{err}");
        std::process::exit(1);
    }
}

fn main_result() -> Result<(), vaerion::VaerionError> {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    let dir =
        std::env::temp_dir().join(format!("vaerion-rust-basic-{}-{nanos}", std::process::id()));
    std::fs::create_dir_all(&dir).map_err(|e| {
        vaerion::VaerionError::new("E1900", format!("cannot create the example workspace: {e}"))
    })?;
    println!("workspace: {}", dir.display());

    let mut agent = Agent::spawn(&dir)?;
    println!(
        "daemon:    {} (spawned, loopback, token pre-provisioned)",
        agent.client.base()
    );

    let result = agent.run("summarize the project from the journal")?;
    let run_id = result["run_id"].as_str().unwrap_or_default();
    println!("run_id:     {run_id}");
    println!(
        "status:     {}",
        result["status"].as_str().unwrap_or_default()
    );
    println!("journal_ok: {}", result["journal_ok"]);
    println!(
        "records:    {}",
        result["receipt"]["journal"]["records"]
            .as_u64()
            .unwrap_or(0)
    );
    println!(
        "head_hash:  {}",
        result["receipt"]["journal"]["head_hash"]
            .as_str()
            .unwrap_or_default()
    );

    let verified = agent.verify(Some(run_id))?;
    println!(
        "verify:     ok={} torn={} records={} head={}",
        verified.ok,
        verified.torn,
        verified.records.unwrap_or(0),
        verified.head_hash.as_deref().unwrap_or_default()
    );

    agent.close();
    let _ = std::fs::remove_dir_all(&dir);
    Ok(())
}
