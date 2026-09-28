// Real output of the Accessible Code Narrator (2025 run, binary search).
// code: the program as Rachel read it · andy: Whisper transcript of Andy's explanation, proofread
// rs / as: clip lengths in seconds (Rachel / Andy), used for captions-only mode.
export const PROGRAM = {
 "file": "binary_search.cpp",
 "totalSeconds": 437,
 "lines": [
  {
   "d": 0,
   "code": "#include <iostream>",
   "andy": "Line 1. This line includes the input-output stream (iostream) library, which provides functionality for input and output operations in C++.",
   "rs": 3.34,
   "as": 9.69
  },
  {
   "d": 0,
   "code": "using namespace std;",
   "andy": "Line 2. This line uses the standard namespace std, which allows access to functions, objects, and other identifiers from the standard C++ library.",
   "rs": 3.37,
   "as": 10.27
  },
  {
   "d": 0,
   "code": "// Function to perform binary search",
   "andy": "Line 3. This line is a comment indicating that the following block of code defines a function to perform binary search.",
   "rs": 3.29,
   "as": 7.24
  },
  {
   "d": 0,
   "code": "int binarySearch(int arr[], int size, int target) {",
   "andy": "Line 4. This line defines a function named binarySearch that takes an integer array, the size of the array, and the target value to be searched as parameters.",
   "rs": 12.02,
   "as": 9.69
  },
  {
   "d": 1,
   "code": "int low = 0;",
   "andy": "Line 5. Within the binarySearch function, an integer variable named low is declared and initialized to zero.",
   "rs": 3.24,
   "as": 6.82
  },
  {
   "d": 1,
   "code": "int high = size - 1;",
   "andy": "Line 6. Another integer variable named high is declared and initialized to size minus 1, where size is the size of the input array.",
   "rs": 3.58,
   "as": 8.91
  },
  {
   "d": 1,
   "code": "while (low <= high) {",
   "andy": "Line 7. This line starts a while loop that continues as long as the low value is less than or equal to the high value.",
   "rs": 7.52,
   "as": 7.34
  },
  {
   "d": 2,
   "code": "int mid = low + (high - low) / 2;",
   "andy": "Line 8. Inside the while loop, an integer variable mid is declared and calculated as the middle point between low and high.",
   "rs": 9.43,
   "as": 7.78
  },
  {
   "d": 2,
   "code": "for (int i = 0; i < size; i++) {",
   "andy": "Line 9. There is a for loop initiated from 0 to size minus 1, which loops to perform an action for each element in the array.",
   "rs": 10.16,
   "as": 7.94
  },
  {
   "d": 3,
   "code": "i = i + 1;",
   "andy": "Line 10. The loop increments the loop variable i by 1 in each iteration.",
   "rs": 2.69,
   "as": 4.55
  },
  {
   "d": 3,
   "code": "for (int j = i; j < size; j++) {",
   "andy": "Line 11. Within the outer for loop, there is an inner for loop that initializes variable j to the value of i and loops up to size minus 1.",
   "rs": 10.27,
   "as": 9.85
  },
  {
   "d": 4,
   "code": "return -1;",
   "andy": "Line 12. The inner for loop contains a return statement that immediately exits the function with a return value of minus 1.",
   "rs": 2.74,
   "as": 7.34
  },
  {
   "d": 3,
   "code": "}",
   "andy": "Line 13. This line signifies the end of the inner for loop block.",
   "rs": 1.99,
   "as": 4.08
  },
  {
   "d": 2,
   "code": "}",
   "andy": "Line 14. This line marks the end of the outer for loop block.",
   "rs": 2.12,
   "as": 3.76
  },
  {
   "d": 2,
   "code": "if (arr[mid] == target)",
   "andy": "Line 15. An if statement checking if the element at index mid in the array is equal to the target value.",
   "rs": 7.55,
   "as": 6.03
  },
  {
   "d": 3,
   "code": "return mid;",
   "andy": "Line 16. If the condition in line 15 is true, the function returns the index mid, indicating the target value was found in the array.",
   "rs": 2.59,
   "as": 9.43
  },
  {
   "d": 2,
   "code": "else if (arr[mid] < target)",
   "andy": "Line 17. If the element at index mid is less than the target value, the function adjusts the low value to mid plus 1.",
   "rs": 6.5,
   "as": 8.36
  },
  {
   "d": 3,
   "code": "low = mid + 1;",
   "andy": "Line 18. Else, if the element at index mid is greater than the target value, the function adjusts the high value to mid minus 1.",
   "rs": 4.0,
   "as": 8.2
  },
  {
   "d": 2,
   "code": "else",
   "andy": "Line 19. This line marks the end of the while loop that iterates until the search range narrows down to a single element.",
   "rs": 1.57,
   "as": 6.69
  },
  {
   "d": 3,
   "code": "high = mid - 1;",
   "andy": "Line 20. End of the else block that updates the high value if the element at mid is less than the target value.",
   "rs": 4.0,
   "as": 6.11
  },
  {
   "d": 1,
   "code": "}",
   "andy": "Line 21. End of the outer while loop.",
   "rs": 2.22,
   "as": 2.46
  },
  {
   "d": 1,
   "code": "return -1;",
   "andy": "Line 22. If no match is found after the binary search, the function returns minus 1, indicating that the target value is not present in the array.",
   "rs": 3.0,
   "as": 8.86
  },
  {
   "d": 0,
   "code": "}",
   "andy": "Line 23. End of the binarySearch function definition.",
   "rs": 2.17,
   "as": 3.37
  },
  {
   "d": 0,
   "code": "int main() {",
   "andy": "Line 24. This line defines the main function, where the program execution starts.",
   "rs": 4.62,
   "as": 4.73
  },
  {
   "d": 1,
   "code": "int arr[] = {2, 4, 7, 10, 15, 20, 25, 30};",
   "andy": "Line 25. An integer array arr is initialized with the values 2, 4, 7, 10, 15, 20, 25, 30.",
   "rs": 11.36,
   "as": 9.2
  },
  {
   "d": 1,
   "code": "int size = sizeof(arr) / sizeof(arr[0]);",
   "andy": "Line 26. The size of the array arr is calculated and stored in the integer variable size.",
   "rs": 17.21,
   "as": 6.95
  },
  {
   "d": 1,
   "code": "int target;",
   "andy": "Line 27. An integer variable target is declared to store the value to be searched in the array.",
   "rs": 2.32,
   "as": 6.16
  },
  {
   "d": 1,
   "code": "cout << \"Enter number to search: \";",
   "andy": "Line 28. The prompt message, enter number to search, is displayed on the console.",
   "rs": 4.91,
   "as": 5.46
  },
  {
   "d": 1,
   "code": "cin >> target;",
   "andy": "Line 29. Input from the user is read and stored in the target variable.",
   "rs": 3.53,
   "as": 4.36
  },
  {
   "d": 1,
   "code": "int result = binarySearch(arr, size, target);",
   "andy": "Line 30. The binarySearch function is called with the input array arr, its size, and the target value as arguments, and the result is stored in the result variable.",
   "rs": 7.76,
   "as": 9.8
  },
  {
   "d": 1,
   "code": "if (result != -1)",
   "andy": "Line 31. If the result is not minus 1, a message indicating the index of the found element is displayed on the console.",
   "rs": 6.27,
   "as": 6.87
  },
  {
   "d": 2,
   "code": "cout << \"Element found at index \" << result << endl;",
   "andy": "Line 32. End of the if block displaying the index where the target element was found.",
   "rs": 8.72,
   "as": 5.09
  },
  {
   "d": 1,
   "code": "else",
   "andy": "Line 33. If the result is minus 1, a message indicating that the element was not found is displayed.",
   "rs": 1.57,
   "as": 6.53
  },
  {
   "d": 2,
   "code": "cout << \"Element not found\" << endl;",
   "andy": "Line 34. End of the else block, displaying the message when the element is not found.",
   "rs": 6.4,
   "as": 4.91
  },
  {
   "d": 0,
   "code": "",
   "andy": "Line 35. This line indicates the end of the conditional blocks.",
   "rs": 1.1,
   "as": 3.66
  },
  {
   "d": 1,
   "code": "return 0;",
   "andy": "Line 36. The main function concludes and returns zero, signaling successful execution of the program.",
   "rs": 2.46,
   "as": 6.53
  },
  {
   "d": 0,
   "code": "}",
   "andy": "Line 37. End of the main function.",
   "rs": 2.32,
   "as": 2.35
  }
 ]
};
