
#include <stdio.h>

int main()
{
    // Arrays to store all 8 input combinations
    int A[8]   = {0, 0, 0, 0, 1, 1, 1, 1};
    int B[8]   = {0, 0, 1, 1, 0, 0, 1, 1};
    int Cin[8] = {0, 1, 0, 1, 0, 1, 0, 1};

    // Arrays to store the outputs
    int Sum[8];
    int Cout[8];

    int i;
    int a, b, cin;
    int found = 0;

    // Calculate outputs for all combinations
    for (i = 0; i < 8; i++)
    {
        int xorAB = A[i] ^ B[i];

        Sum[i] = xorAB ^ Cin[i];
        Cout[i] = (A[i] & B[i]) | (Cin[i] & xorAB);
    }

    // Display the truth table
    printf("\n========== FULL ADDER TRUTH TABLE ==========\n");
    printf("--------------------------------------------\n");
    printf(" A | B | Cin | Sum | Carry\n");
    printf("--------------------------------------------\n");

    for (i = 0; i < 8; i++)
    {
        printf(" %d | %d |  %d  |  %d  |   %d\n",
               A[i], B[i], Cin[i], Sum[i], Cout[i]);
    }

    printf("--------------------------------------------\n");

    // Search for a particular input combination
    printf("\n========== SEARCH FULL ADDER OUTPUT ==========\n");

    printf("Enter A (0 or 1): ");
    if (scanf("%d", &a) != 1 || (a != 0 && a != 1))
    {
        printf("Invalid input for A.\n");
        return 1;
    }

    printf("Enter B (0 or 1): ");
    if (scanf("%d", &b) != 1 || (b != 0 && b != 1))
    {
        printf("Invalid input for B.\n");
        return 1;
    }

    printf("Enter Carry-in (0 or 1): ");
    if (scanf("%d", &cin) != 1 || (cin != 0 && cin != 1))
    {
        printf("Invalid input for Carry-in.\n");
        return 1;
    }

    // Search the arrays
    for (i = 0; i < 8; i++)
    {
        if (A[i] == a && B[i] == b && Cin[i] == cin)
        {
            found = 1;

            printf("\nInput combination found!\n");
            printf("A = %d, B = %d, Cin = %d\n", a, b, cin);
            printf("Sum = %d\n", Sum[i]);
            printf("Carry-out = %d\n", Cout[i]);
            printf("Final binary result = %d%d\n", Cout[i], Sum[i]);

            break;
        }
    }

    if (found == 0)
    {
        printf("Input combination not found.\n");
    }

    return 0;
}
