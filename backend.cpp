#include "crow.h" 
#include <vector>

using namespace std;

// --- SUDOKU LOGIC ---
bool isSafe(vector<vector<int>>& board, int row, int col, int num) {
    for (int x = 0; x < 9; x++)
        if (board[row][x] == num || board[x][col] == num) return false;
    int startRow = row - row % 3, startCol = col - col % 3;
    for (int i = 0; i < 3; i++)
        for (int j = 0; j < 3; j++)
            if (board[i + startRow][j + startCol] == num) return false;
    return true;
}

bool solveSudokuLogic(vector<vector<int>>& board, int row, int col) {
    if (row == 8 && col == 9) return true;
    if (col == 9) { row++; col = 0; }
    if (board[row][col] > 0) return solveSudokuLogic(board, row, col + 1);
    for (int num = 1; num <= 9; num++) {
        if (isSafe(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudokuLogic(board, row, col + 1)) return true;
            board[row][col] = 0;
        }
    }
    return false;
}

// --- TOWER OF HANOI LOGIC ---
void solveHanoiLogic(int n, int from, int to, int aux, vector<crow::json::wvalue>& moves) {
    if (n == 0) return;
    solveHanoiLogic(n - 1, from, aux, to, moves);
    
    crow::json::wvalue move;
    move["from"] = from;
    move["to"] = to;
    moves.push_back(move);
    
    solveHanoiLogic(n - 1, aux, to, from, moves);
}

// --- MAIN SERVER API ---
int main() {
    crow::SimpleApp app;

    // OPTIONS handler for CORS preflight requests
    CROW_ROUTE(app, "/api/solve-sudoku").methods(crow::HTTPMethod::OPTIONS)
    ([]() {
        crow::response resp(200);
        resp.add_header("Access-Control-Allow-Origin", "*");
        resp.add_header("Access-Control-Allow-Headers", "Content-Type");
        return resp;
    });

    // POST: Sudoku Solver Endpoint
    CROW_ROUTE(app, "/api/solve-sudoku").methods(crow::HTTPMethod::POST)
    ([](const crow::request& req) {
        auto x = crow::json::load(req.body);
        if (!x) return crow::response(400);
        
        vector<vector<int>> board(9, vector<int>(9));
        for(int i = 0; i < 9; i++) {
            for(int j = 0; j < 9; j++) {
                board[i][j] = x["board"][i][j].i();
            }
        }

        solveSudokuLogic(board, 0, 0);

        crow::json::wvalue res;
        for(int i = 0; i < 9; i++) {
            for(int j = 0; j < 9; j++) {
                res["solvedBoard"][i][j] = board[i][j];
            }
        }

        crow::response resp(res);
        resp.add_header("Access-Control-Allow-Origin", "*");
        return resp;
    });

    // GET: Tower of Hanoi Endpoint
    CROW_ROUTE(app, "/api/solve-hanoi")
    ([](const crow::request& req) {
        int disks = 3;
        if (req.url_params.get("disks") != nullptr) {
            disks = stoi(req.url_params.get("disks"));
        }
        
        vector<crow::json::wvalue> moves;
        solveHanoiLogic(disks, 0, 2, 1, moves);

        crow::json::wvalue res;
        res["moves"] = std::move(moves);
        
        crow::response resp(res);
        resp.add_header("Access-Control-Allow-Origin", "*");
        return resp;
    });

    // Start server on port 5000
    app.port(5000).multithreaded().run();
}