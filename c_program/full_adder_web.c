
#include <emscripten.h>

// Arrays store all 8 possible input combinations
int A[8] = {0, 0, 0, 0, 1, 1, 1, 1};
int B[8] = {0, 0, 1, 1, 0, 0, 1, 1};
int Cin[8] = {0, 1, 0, 1, 0, 1, 0, 1};

// Calculate Sum using C
EMSCRIPTEN_KEEPALIVE
int calculateSum(int a, int b, int cin)
{
    return a ^ b ^ cin;
}

// Calculate Carry using C
EMSCRIPTEN_KEEPALIVE
int calculateCarry(int a, int b, int cin)
{
    int xorAB = a ^ b;
    return (a & b) | (cin & xorAB);
}

// Return a stored input value from the array
EMSCRIPTEN_KEEPALIVE
int getInputValue(int row, int column)
{
    if (row < 0 || row >= 8)
        return -1;

    if (column == 0)
        return A[row];

    if (column == 1)
        return B[row];

    if (column == 2)
        return Cin[row];

    return -1;
}
