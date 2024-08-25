// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::collections::HashMap;

use rand::Rng;
use serde::Serialize;

#[derive(Serialize)]
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

struct CellPosition {
    row: usize,
    col: usize,
}

fn get_mines_coordinates(rows: usize, cols: usize, count: usize, first_click: CellPosition) -> HashMap<String, (usize, usize)>  {
    let mut coordinates: HashMap<String, (usize, usize)> = HashMap::with_capacity(count);
    let mut mines_left = count;

    while mines_left  > 0 {
       let random_row = rand::thread_rng().gen_range(0..rows);
       let random_col = rand::thread_rng().gen_range(0..cols); 
       
       let random_position = format!("{}-{}", random_row, random_col);
  
       if coordinates.contains_key(&random_position) || (random_row == first_click.row && random_col == first_click.col) {
            continue;
       }

       coordinates.insert(random_position, (random_row, random_col));
     
       mines_left  -= 1;
   }

   return coordinates;
}

// TODO: This is kind of verbose, find a way to simplify it
fn get_neighbor_cells(row: usize, col: usize, max_row: usize, max_col: usize) -> Vec<CellPosition> {
    let mut neighbors: Vec<CellPosition> = Vec::new();

    if row > 0 {
        neighbors.push(CellPosition { row: row - 1, col });
    
        if col > 0 {
           neighbors.push(CellPosition { row: row - 1, col: col - 1 });
        }
        if col < max_col {
           neighbors.push(CellPosition { row: row - 1, col: col + 1 });
        }
    }

    if row < max_row {
        neighbors.push(CellPosition { row: row + 1, col });
    
        if col > 0 {
           neighbors.push(CellPosition { row: row + 1, col: col - 1 });
        }
        if col < max_col {
           neighbors.push(CellPosition { row: row + 1, col: col + 1 });
        }
    }

    if col > 0 {
        neighbors.push(CellPosition { row, col: col - 1 });
    }

    if col < max_col {
        neighbors.push(CellPosition { row, col: col + 1 });
    }

    return neighbors;
}


fn plant_mines(coordinates: HashMap<String, (usize, usize)>, board: &mut Vec<Vec<Cell>>) -> &mut Vec<Vec<Cell>> {
  for position in coordinates.into_iter() {
    let (_, (row, col)) = position;
    let max_row = board.len() - 1;
    let max_col = board[0].len() - 1;
    let neighbors = get_neighbor_cells(row, col, max_row, max_col);

    board[row][col].has_bomb = true;

    neighbors.into_iter().for_each(|position| {
        if board[position.row][position.col].has_bomb {
            return;
        }

        board[position.row][position.col].bombs_around += 1;
    });
  }

    return board;
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_empty_board(rows: usize, cols: usize)->Vec<Vec<Cell>>{
    return make_empty_board(rows, cols);
}

#[tauri::command]
fn get_full_board(rows: usize, cols: usize, mines_count: usize, first_click_row: usize, first_click_col: usize) -> String {
    let mut empty_board = make_empty_board(rows, cols);
    let coordinates = get_mines_coordinates(rows, cols, mines_count, CellPosition {row: first_click_row, col: first_click_col} );
    let full_board = plant_mines(coordinates, &mut empty_board);
    let json = serde_json::to_string(&full_board).unwrap();

    return json;
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, get_empty_board, get_full_board])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
