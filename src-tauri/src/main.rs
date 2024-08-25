// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::collections::HashMap;

use rand::Rng;


#[derive(Debug)]
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

fn get_mines_coordinates(rows: usize, cols: usize, count: usize, first_click: Position ) -> HashMap<String, (usize, usize)>  {
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
fn get_neighbor_cells(row: usize, col: usize, max_row: usize, max_col: usize) -> Vec<Position> {
    let mut neighbors: Vec<Position> = Vec::new();

    if row > 0 {
        neighbors.push(Position { row: row - 1, col });
    
        if col > 0 {
           neighbors.push(Position { row: row - 1, col: col - 1 });
        }
        if col < max_col {
           neighbors.push(Position { row: row - 1, col: col + 1 });
        }
    }

    if row < max_row {
        neighbors.push(Position { row: row + 1, col });
    
        if col > 0 {
           neighbors.push(Position { row: row + 1, col: col - 1 });
        }
        if col < max_col {
           neighbors.push(Position { row: row + 1, col: col + 1 });
        }
    }

    if col > 0 {
        neighbors.push(Position { row, col: col - 1 });
    }

    if col < max_col {
        neighbors.push(Position { row, col: col + 1 });
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

fn main() {
    let mut empty_board = make_empty_board(9, 9);
    let coordinates = get_mines_coordinates(9, 9, 9, Position{row:1,col:1});

    let new_board = plant_mines(coordinates, &mut empty_board);

    println!("board is {:?}", new_board);

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
