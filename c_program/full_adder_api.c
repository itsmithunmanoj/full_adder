
#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[])
{
    if (argc != 4)
    {
        printf("Invalid number of inputs");
        return 1;
    }

    int A = atoi(argv[1]);
    int B = atoi(argv[2]);
    int Cin = atoi(argv[3]);

    if ((A != 0 && A != 1) ||
        (B != 0 && B != 1) ||
        (Cin != 0 && Cin != 1))
    {
        printf("Invalid binary input");
        return 1;
    }

    int xorAB = A ^ B;

    int Sum = xorAB ^ Cin;
    int Cout = (A & B) | (Cin & xorAB);

    // Send the results to Node.js
    printf("%d %d", Sum, Cout);

    return 0;
}
