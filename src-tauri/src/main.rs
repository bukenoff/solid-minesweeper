// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{fs::{self, File}, io::Write, path::PathBuf};

use serde_json::json;
use tauri::Manager;

#[tauri::command]
fn add_score(app_handle: tauri::AppHandle, name:String, score_time: u64) -> Result<(), String> {
    match app_handle.path().resource_dir() {
        Ok(path)=>{
            let scores_path = path.join("scores.json");

            match File::open(&scores_path){
                Ok(file) => {
                    let mut json_response:serde_json::Value=serde_json::from_reader(&file).expect("File should be proper json");

                    if let Some(scores) = json_response["scores"].as_array_mut(){
                        for score in scores.iter_mut(){
                            if let Some(time) = score["time"].as_u64(){
                                if time > score_time {
                                    *score = json!({ "name": name, "time": score_time });
                                    break;
                                }
                            }
                        }
                    }

                    match serde_json::to_string_pretty(&json_response){
                        Ok(updated_json) => {
                            fs::write(scores_path, updated_json).unwrap();
                            Ok(())
                        },
                        Err(error) => {
                            eprintln!("Error writing file: {}",error);
                            return Err("Error writing file".into());
                        }
                    }
                },
                Err(error) => {
                    eprintln!("Error opening file: {}",error);
                    return Err("Error opening file".into());
                }
            }
        }
        Err(_) => todo!(), }
}

fn create_scores(scores_path: &PathBuf) -> Option<serde_json::Value> {
    match File::create(scores_path) {
        Ok(mut file) => {
            let new_scores = json!({
                "scores": [
                    { "name": "serik", "time": 0 },
                    { "name": "Marcus Aurelius", "time": 1 },
                    { "name": "Lucius Seneca", "time": 2 },
                    { "name": "Epictetus", "time": 3 },
                    { "name": "Epicurus", "time": 4 },
                    { "name": "Socrates", "time": 5 },
                    { "name": "John Doe", "time": 6 },
                    { "name": "Abraham Lincoln", "time": 7 },
                    { "name": "whatever", "time": 8 },
                    { "name": "last guy", "time": 100 },
                ] 
            });

            let serialized_data = serde_json::to_string_pretty(&new_scores).unwrap();
            file.write_all(serialized_data.as_bytes()).expect("write failed");

            return Some(new_scores);
        },
        Err(error) => {
            eprintln!("Error creating a new file: {}", error);
            return None;
        }
    }
}

#[tauri::command]
fn get_last_score(app_handle: tauri::AppHandle) -> Result<serde_json::Value, String> {
    match app_handle.path().resource_dir() {
        Ok(path) => {
            let scores_path = path.join("scores.json");

            if !scores_path.exists() {
                match create_scores(&scores_path) {
                    Some(scores) => return Ok(scores["scores"][9].clone()),
                    _ => {
                        eprintln!("Could not create scores");
                    }
                }
            } 
            println!("File already exists");
            match File::open(scores_path) {
                Ok(file) => {
                    let json_response: serde_json::Value = serde_json::from_reader(&file).expect("File should be proper json");
                    Ok(json_response["scores"][9].clone())
                },
                Err(error) => {
                    eprintln!("Error opening file: {}", error);
                    return Err("Error opening file".into());
                }
            }

        }
        Err(_) => {
            eprintln!("Could not open resource dir");
            Err("Could not open resource dir".into())
        },
    }
}

#[tauri::command]
fn get_scores(app_handle: tauri::AppHandle) -> Result<serde_json::Value , String> {
    match app_handle.path().resource_dir() {
        Ok(path)=>{
            let scores_path = path.join("scores.json");

            if !scores_path.exists() {
                match create_scores(&scores_path) {
                    Some(scores) => return Ok(scores),
                    _ => {
                        eprintln!("Could not create scores");
                    }
                }
            } 

            println!("File already exists");
            match File::open(scores_path) {
                Ok(file) => {
                    let json_response: serde_json::Value = serde_json::from_reader(&file).expect("File should be proper json");
                    Ok(json_response)
                },
                Err(error) => {
                    eprintln!("Error opening file: {}", error);
                    return Err("Error opening file".into());
                }
            }
        }
        Err(error) => {
            eprintln!("Error opening folder: {}", error);
            return Err("Error opening folder".into());
        },
    }

}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![get_scores, add_score, get_last_score])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
