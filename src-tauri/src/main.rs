// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::collections::HashSet;

use rand::Rng;

struct Cell {
    row: usize,
    col: usize,
    has_bomb: bool,
    bombs_around: usize,
    is_open: bool,
    is_flagged: bool,

}

fn make_empty_board(rows: usize, cols: usize)-> Vec<Vec<Cell>> {
    let mut board = Vec::with_capacity(rows);

    for r in 0..rows {
        let mut row = Vec::with_capacity(cols);

        for c in 0..cols {
            let cell = Cell {
                row: r,
                col: c,
                has_bomb: false,
                bombs_around: 0,
                is_open: false,
                is_flagged: false,
            };
            row.push(cell);
        } 
        board.push(row);
    }

    return board;
}

struct Position {
    row: usize,
    col: usize,
}

fn get_mines_coordinates(rows: usize, cols: usize, mut count: usize, first_click: Position ) -> HashSet<String>  {
    let mut coordinates: HashSet<String> = HashSet::with_capacity(count);

    while count > 0 {
       let random_row = rand::thread_rng().gen_range(0..rows);
       let random_col = rand::thread_rng().gen_range(0..cols); 
       
       let random_position = format!("{}-{}", random_row, random_col);
  
       if coordinates.contains(&random_position) || (random_row == first_click.row && random_col == first_click.col) {
            continue;
       }

       coordinates.insert(random_position);
     
       count -= 1;
   }

   return coordinates;
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
