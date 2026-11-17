
const express = require("express");
const { execFile } = require("child_process");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());

// Locate the compiled C program
const cProgram = path.join(
    __dirname,
    "..",
    "c_program",
    "full_adder_api.exe"
);

// Serve the website
app.use(express.static(
    path.join(__dirname, "..", "frontend")
));

// Receive inputs and run the C program
app.post("/api/calculate", (req, res) => {

    const { A, B, Cin } = req.body;

    const inputs = [A, B, Cin];

    if (!inputs.every(
        value => value === 0 || value === 1
    )) {
        return res.status(400).json({
            error: "Inputs must be 0 or 1."
        });
    }

    execFile(
        cProgram,
        [String(A), String(B), String(Cin)],
        (error, stdout, stderr) => {

            if (error) {
                console.error(stderr || error.message);

                return res.status(500).json({
                    error: "C program execution failed."
                });
            }

            const values = stdout.trim().split(/\s+/);

            const sum = Number(values[0]);
            const carry = Number(values[1]);

            if (
                values.length !== 2 ||
                ![0, 1].includes(sum) ||
                ![0, 1].includes(carry)
            ) {
                return res.status(500).json({
                    error: "Invalid response from C program."
                });
            }

            res.json({
                sum: sum,
                carry: carry,
                result: String(carry) + String(sum)
            });
        }
    );
});

app.listen(PORT, () => {
    console.log(`Full Adder Server running at http://localhost:${PORT}`);
});
