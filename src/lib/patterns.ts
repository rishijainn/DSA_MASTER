export interface Problem {
  title: string
  leetcode_url: string
}

export interface Pattern {
  name: string
  description: string
  problems?: Problem[]
  subgroups?: Record<string, Problem[]>
}

export const patterns: Pattern[] = [
  {
    "name": "Fast and Slow Pointer",
    "description": "This technique uses two pointers moving at different speeds to solve problems involving cycles, such as finding the middle of a list, detecting loops, or checking for palindromes.",
    "problems": [
      {
        "title": "Linked List Cycle II",
        "leetcode_url": "https://leetcode.com/problems/linked-list-cycle-ii/"
      },
      {
        "title": "Remove nth Node from the End of List",
        "leetcode_url": "https://leetcode.com/problems/remove-nth-node-from-the-end-of-list/"
      },
      {
        "title": "Find the Duplicate Number",
        "leetcode_url": "https://leetcode.com/problems/find-the-duplicate-number/"
      },
      {
        "title": "Palindrome Linked List",
        "leetcode_url": "https://leetcode.com/problems/palindrome-linked-list/"
      }
    ]
  },
  {
    "name": "Overlapping Intervals",
    "description": "Intervals are often manipulated through sorting and merging based on their start and end times.",
    "problems": [
      {
        "title": "Merge Intervals",
        "leetcode_url": "https://leetcode.com/problems/merge-intervals/"
      },
      {
        "title": "Insert Interval",
        "leetcode_url": "https://leetcode.com/problems/insert-interval/"
      },
      {
        "title": "My Calendar II",
        "leetcode_url": "https://leetcode.com/problems/my-calendar-ii/"
      },
      {
        "title": "Minimum Number of Arrows to Burst Balloons",
        "leetcode_url": "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/"
      },
      {
        "title": "Non-overlapping Intervals",
        "leetcode_url": "https://leetcode.com/problems/non-overlapping-intervals/"
      }
    ]
  },
  {
    "name": "Prefix Sum",
    "description": "Prefix Sums/Products are techniques that store cumulative sums or products up to each index, allowing for quick subarray range queries.",
    "problems": [
      {
        "title": "Find the middle index in array",
        "leetcode_url": "https://leetcode.com/problems/find-the-middle-index-in-array/"
      },
      {
        "title": "Product of array except self",
        "leetcode_url": "https://leetcode.com/problems/product-of-array-except-self/"
      },
      {
        "title": "Maximum product subarray",
        "leetcode_url": "https://leetcode.com/problems/maximum-product-subarray/"
      },
      {
        "title": "Number of ways to split array",
        "leetcode_url": "https://leetcode.com/problems/number-of-ways-to-split-array/"
      },
      {
        "title": "Range Sum Query 2D",
        "leetcode_url": "https://leetcode.com/problems/range-sum-query-2d/"
      }
    ]
  },
  {
    "name": "Sliding Window",
    "description": "A sliding window is a subarray or substring that moves over data to solve problems efficiently in linear time.",
    "subgroups": {
      "Fixed Size": [
        {
          "title": "Maximum Sum Subarray of Size K",
          "leetcode_url": "https://leetcode.com/problems/maximum-sum-subarray-of-size-k/"
        },
        {
          "title": "Number of Subarrays having Average Greater or Equal to Threshold",
          "leetcode_url": "https://leetcode.com/problems/number-of-subarrays-having-average-greater-or-equal-to-threshold/"
        },
        {
          "title": "Repeated DNA sequences",
          "leetcode_url": "https://leetcode.com/problems/repeated-dna-sequences/"
        },
        {
          "title": "Permutation in String",
          "leetcode_url": "https://leetcode.com/problems/permutation-in-string/"
        },
        {
          "title": "Sliding Subarray Beauty",
          "leetcode_url": "https://leetcode.com/problems/sliding-subarray-beauty/"
        },
        {
          "title": "Sliding Window Maximum",
          "leetcode_url": "https://leetcode.com/problems/sliding-window-maximum/"
        }
      ],
      "Variable Size": [
        {
          "title": "Longest Substring Without Repeating Characters",
          "leetcode_url": "https://leetcode.com/problems/longest-substring-without-repeating-characters/"
        },
        {
          "title": "Minimum Size Subarray Sum",
          "leetcode_url": "https://leetcode.com/problems/minimum-size-subarray-sum/"
        },
        {
          "title": "Subarray Product Less Than K",
          "leetcode_url": "https://leetcode.com/problems/subarray-product-less-than-k/"
        },
        {
          "title": "Max Consecutive Ones",
          "leetcode_url": "https://leetcode.com/problems/max-consecutive-ones/"
        },
        {
          "title": "Fruits Into Baskets",
          "leetcode_url": "https://leetcode.com/problems/fruits-into-baskets/"
        },
        {
          "title": "Count Number of Nice Subarrays",
          "leetcode_url": "https://leetcode.com/problems/count-number-of-nice-subarrays/"
        },
        {
          "title": "Minimum Window Substring",
          "leetcode_url": "https://leetcode.com/problems/minimum-window-substring/"
        }
      ]
    }
  },
  {
    "name": "Two Pointers",
    "description": "The two pointers technique involves having two different indices move through the input at different speeds to solve various array or linked list problems.",
    "problems": [
      {
        "title": "Two Sum II - Input Array is Sorted",
        "leetcode_url": "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/"
      },
      {
        "title": "Sort Colors",
        "leetcode_url": "https://leetcode.com/problems/sort-colors/"
      },
      {
        "title": "Next Permutation",
        "leetcode_url": "https://leetcode.com/problems/next-permutation/"
      },
      {
        "title": "Bag of Tokens",
        "leetcode_url": "https://leetcode.com/problems/bag-of-tokens/"
      },
      {
        "title": "Container with most water",
        "leetcode_url": "https://leetcode.com/problems/container-with-most-water/"
      },
      {
        "title": "Trapping Rain Water",
        "leetcode_url": "https://leetcode.com/problems/trapping-rain-water/"
      }
    ]
  },
  {
    "name": "Cyclic Sort (Index-Based)",
    "description": "Cyclic sort is an efficient approach to solve problems where numbers are consecutively ordered and must be placed in the correct index.",
    "problems": [
      {
        "title": "Missing Number",
        "leetcode_url": "https://leetcode.com/problems/missing-number/"
      },
      {
        "title": "Find Missing Numbers",
        "leetcode_url": "https://leetcode.com/problems/find-missing-numbers/"
      },
      {
        "title": "Set Mismatch",
        "leetcode_url": "https://leetcode.com/problems/set-mismatch/"
      },
      {
        "title": "First Missing Positive",
        "leetcode_url": "https://leetcode.com/problems/first-missing-positive/"
      }
    ]
  },
  {
    "name": "Reversal of Linked List (In-place)",
    "description": "Reversing a linked list in place without using extra space is key for problems that require in-place list manipulations.",
    "problems": [
      {
        "title": "Reverse Linked List",
        "leetcode_url": "https://leetcode.com/problems/reverse-linked-list/"
      },
      {
        "title": "Reverse Nodes in k-Group",
        "leetcode_url": "https://leetcode.com/problems/reverse-nodes-in-k-group/"
      },
      {
        "title": "Swap Nodes in Pairs",
        "leetcode_url": "https://leetcode.com/problems/swap-nodes-in-pairs/"
      }
    ]
  },
  {
    "name": "Matrix Manipulation",
    "description": "Problems involving 2D arrays (matrices) are often solved using row-column traversal or manipulation based on matrix properties.",
    "problems": [
      {
        "title": "Rotate Image",
        "leetcode_url": "https://leetcode.com/problems/rotate-image/"
      },
      {
        "title": "Spiral Matrix",
        "leetcode_url": "https://leetcode.com/problems/spiral-matrix/"
      },
      {
        "title": "Set Matrix Zeroes",
        "leetcode_url": "https://leetcode.com/problems/set-matrix-zeroes/"
      },
      {
        "title": "Game of Life",
        "leetcode_url": "https://leetcode.com/problems/game-of-life/"
      }
    ]
  },
  {
    "name": "Breadth First Search (BFS)",
    "description": "BFS explores nodes level by level using a queue. It is particularly useful for shortest path problems.",
    "problems": [
      {
        "title": "Shortest Path in Binary Matrix",
        "leetcode_url": "https://leetcode.com/problems/shortest-path-in-binary-matrix/"
      },
      {
        "title": "Rotten Oranges",
        "leetcode_url": "https://leetcode.com/problems/rotten-oranges/"
      },
      {
        "title": "As Far From Land as Possible",
        "leetcode_url": "https://leetcode.com/problems/as-far-from-land-as-possible/"
      },
      {
        "title": "Word Ladder",
        "leetcode_url": "https://leetcode.com/problems/word-ladder/"
      }
    ]
  },
  {
    "name": "Depth First Search (DFS)",
    "description": "DFS explores as far as possible along a branch before backtracking. It's useful for graph traversal, pathfinding, and connected components.",
    "problems": [
      {
        "title": "Number of Closed Islands",
        "leetcode_url": "https://leetcode.com/problems/number-of-closed-islands/"
      },
      {
        "title": "Coloring a Border",
        "leetcode_url": "https://leetcode.com/problems/coloring-a-border/"
      },
      {
        "title": "Number of Enclaves",
        "leetcode_url": "https://leetcode.com/problems/number-of-enclaves/"
      },
      {
        "title": "Time Needed to Inform all Employees",
        "leetcode_url": "https://leetcode.com/problems/time-needed-to-inform-all-employees/"
      },
      {
        "title": "Find Eventual Safe States",
        "leetcode_url": "https://leetcode.com/problems/find-eventual-safe-states/"
      }
    ]
  },
  {
    "name": "Backtracking",
    "description": "Backtracking helps in problems where you need to explore all potential solutions, such as solving puzzles, generating combinations, or finding paths.",
    "problems": [
      {
        "title": "Permutation II",
        "leetcode_url": "https://leetcode.com/problems/permutation-ii/"
      },
      {
        "title": "Combination Sum",
        "leetcode_url": "https://leetcode.com/problems/combination-sum/"
      },
      {
        "title": "Generate Parenthesis",
        "leetcode_url": "https://leetcode.com/problems/generate-parenthesis/"
      },
      {
        "title": "N-Queens",
        "leetcode_url": "https://leetcode.com/problems/n-queens/"
      },
      {
        "title": "Sudoku Solver",
        "leetcode_url": "https://leetcode.com/problems/sudoku-solver/"
      },
      {
        "title": "Palindrome Partitioning",
        "leetcode_url": "https://leetcode.com/problems/palindrome-partitioning/"
      },
      {
        "title": "Word Search",
        "leetcode_url": "https://leetcode.com/problems/word-search/"
      }
    ]
  },
  {
    "name": "Modified Binary Search",
    "description": "A modified version of binary search that applies to rotated arrays, unsorted arrays, or specialized conditions.",
    "problems": [
      {
        "title": "Search in Rotated Sorted Array",
        "leetcode_url": "https://leetcode.com/problems/search-in-rotated-sorted-array/"
      },
      {
        "title": "Find Minimum in Rotated Sorted Array",
        "leetcode_url": "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/"
      },
      {
        "title": "Find Peak Element",
        "leetcode_url": "https://leetcode.com/problems/find-peak-element/"
      },
      {
        "title": "Single element in a sorted array",
        "leetcode_url": "https://leetcode.com/problems/single-element-in-a-sorted-array/"
      },
      {
        "title": "Minimum Time to Arrive on Time",
        "leetcode_url": "https://leetcode.com/problems/minimum-time-to-arrive-on-time/"
      },
      {
        "title": "Capacity to Ship Packages within D Days",
        "leetcode_url": "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/"
      },
      {
        "title": "Koko Eating Bananas",
        "leetcode_url": "https://leetcode.com/problems/koko-eating-bananas/"
      },
      {
        "title": "Find in Mountain Array",
        "leetcode_url": "https://leetcode.com/problems/find-in-mountain-array/"
      },
      {
        "title": "Median of Two Sorted Arrays",
        "leetcode_url": "https://leetcode.com/problems/median-of-two-sorted-arrays/"
      }
    ]
  },
  {
    "name": "Bitwise XOR",
    "description": "XOR is a powerful bitwise operator that can solve problems like finding single numbers or efficiently pairing elements.",
    "problems": [
      {
        "title": "Missing Number",
        "leetcode_url": "https://leetcode.com/problems/missing-number/"
      },
      {
        "title": "Single Number II",
        "leetcode_url": "https://leetcode.com/problems/single-number-ii/"
      },
      {
        "title": "Single Number III",
        "leetcode_url": "https://leetcode.com/problems/single-number-iii/"
      },
      {
        "title": "Find the Original array of Prefix XOR",
        "leetcode_url": "https://leetcode.com/problems/find-the-original-array-of-prefix-xor/"
      },
      {
        "title": "XOR Queries of a Subarray",
        "leetcode_url": "https://leetcode.com/problems/xor-queries-of-a-subarray/"
      }
    ]
  },
  {
    "name": "Top 'K' Elements",
    "description": "This pattern uses heaps or quickselect to efficiently find the top 'K' largest/smallest elements from a dataset.",
    "problems": [
      {
        "title": "Top K Frequent Elements",
        "leetcode_url": "https://leetcode.com/problems/top-k-frequent-elements/"
      },
      {
        "title": "Kth Largest Element in an Array",
        "leetcode_url": "https://leetcode.com/problems/kth-largest-element-in-an-array/"
      },
      {
        "title": "Ugly Number II",
        "leetcode_url": "https://leetcode.com/problems/ugly-number-ii/"
      },
      {
        "title": "K Closest Points to Origin",
        "leetcode_url": "https://leetcode.com/problems/k-closest-points-to-origin/"
      }
    ]
  },
  {
    "name": "K-way Merge",
    "description": "The K-way merge technique uses a heap to efficiently merge multiple sorted lists or arrays.",
    "problems": [
      {
        "title": "Find K Pairs with Smallest Sums",
        "leetcode_url": "https://leetcode.com/problems/find-k-pairs-with-smallest-sums/"
      },
      {
        "title": "Kth Smallest Element in a Sorted Matrix",
        "leetcode_url": "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/"
      },
      {
        "title": "Merge K Sorted Lists",
        "leetcode_url": "https://leetcode.com/problems/merge-k-sorted-lists/"
      },
      {
        "title": "Smallest Range Covering Elements from K Lists",
        "leetcode_url": "https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/"
      }
    ]
  },
  {
    "name": "Two Heaps",
    "description": "This pattern uses two heaps (max heap and min heap) to solve problems involving tracking medians and efficiently managing dynamic data.",
    "problems": [
      {
        "title": "Find Median from Data Stream",
        "leetcode_url": "https://leetcode.com/problems/find-median-from-data-stream/"
      },
      {
        "title": "Sliding Window Median",
        "leetcode_url": "https://leetcode.com/problems/sliding-window-median/"
      },
      {
        "title": "IPO",
        "leetcode_url": "https://leetcode.com/problems/ipo/"
      }
    ]
  },
  {
    "name": "Monotonic Stack",
    "description": "A monotonic stack helps solve range queries by maintaining a stack of elements in increasing or decreasing order.",
    "problems": [
      {
        "title": "Next Greater Element II",
        "leetcode_url": "https://leetcode.com/problems/next-greater-element-ii/"
      },
      {
        "title": "Next Greater Node in Linked List",
        "leetcode_url": "https://leetcode.com/problems/next-greater-node-in-linked-list/"
      },
      {
        "title": "Daily Temperatures",
        "leetcode_url": "https://leetcode.com/problems/daily-temperatures/"
      },
      {
        "title": "Online Stock Span",
        "leetcode_url": "https://leetcode.com/problems/online-stock-span/"
      },
      {
        "title": "Maximum Width Ramp",
        "leetcode_url": "https://leetcode.com/problems/maximum-width-ramp/"
      },
      {
        "title": "Largest Rectangle in Histogram",
        "leetcode_url": "https://leetcode.com/problems/largest-rectangle-in-histogram/"
      }
    ]
  },
  {
    "name": "Trees",
    "description": "Traversal, construction, height, and ancestor problems on binary trees and BSTs.",
    "subgroups": {
      "Level Order Traversal (BFS in Binary Tree)": [
        {
          "title": "Level order Traversal",
          "leetcode_url": "https://leetcode.com/problems/level-order-traversal/"
        },
        {
          "title": "Zigzag Level order Traversal",
          "leetcode_url": "https://leetcode.com/problems/zigzag-level-order-traversal/"
        },
        {
          "title": "Even Odd Tree",
          "leetcode_url": "https://leetcode.com/problems/even-odd-tree/"
        },
        {
          "title": "Reverse odd Levels",
          "leetcode_url": "https://leetcode.com/problems/reverse-odd-levels/"
        },
        {
          "title": "Deepest Leaves Sum",
          "leetcode_url": "https://leetcode.com/problems/deepest-leaves-sum/"
        },
        {
          "title": "Add one row to Tree",
          "leetcode_url": "https://leetcode.com/problems/add-one-row-to-tree/"
        },
        {
          "title": "Maximum width of Binary Tree",
          "leetcode_url": "https://leetcode.com/problems/maximum-width-of-binary-tree/"
        },
        {
          "title": "All Nodes Distance K in Binary tree",
          "leetcode_url": "https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree/"
        }
      ],
      "Tree Construction": [
        {
          "title": "Construct BT from Preorder and Inorder",
          "leetcode_url": "https://leetcode.com/problems/construct-bt-from-preorder-and-inorder/"
        },
        {
          "title": "Construct BT from Postorder and Inorder",
          "leetcode_url": "https://leetcode.com/problems/construct-bt-from-postorder-and-inorder/"
        },
        {
          "title": "Maximum Binary Tree",
          "leetcode_url": "https://leetcode.com/problems/maximum-binary-tree/"
        },
        {
          "title": "Construct BST from Preorder",
          "leetcode_url": "https://leetcode.com/problems/construct-bst-from-preorder/"
        }
      ],
      "Height related Problems": [
        {
          "title": "Maximum Depth of BT",
          "leetcode_url": "https://leetcode.com/problems/maximum-depth-of-bt/"
        },
        {
          "title": "Balanced Binary Tree",
          "leetcode_url": "https://leetcode.com/problems/balanced-binary-tree/"
        },
        {
          "title": "Diameter of Binary Tree",
          "leetcode_url": "https://leetcode.com/problems/diameter-of-binary-tree/"
        },
        {
          "title": "Minimum Depth of BT",
          "leetcode_url": "https://leetcode.com/problems/minimum-depth-of-bt/"
        }
      ],
      "Root to leaf path problems": [
        {
          "title": "Binary Tree Paths",
          "leetcode_url": "https://leetcode.com/problems/binary-tree-paths/"
        },
        {
          "title": "Path Sum II",
          "leetcode_url": "https://leetcode.com/problems/path-sum-ii/"
        },
        {
          "title": "Sum Root to Leaf numbers",
          "leetcode_url": "https://leetcode.com/problems/sum-root-to-leaf-numbers/"
        },
        {
          "title": "Smallest string starting from Leaf",
          "leetcode_url": "https://leetcode.com/problems/smallest-string-starting-from-leaf/"
        },
        {
          "title": "Insufficient nodes in root to Leaf",
          "leetcode_url": "https://leetcode.com/problems/insufficient-nodes-in-root-to-leaf/"
        },
        {
          "title": "Pseudo-Palindromic Paths in a Binary Tree",
          "leetcode_url": "https://leetcode.com/problems/pseudo-palindromic-paths-in-a-binary-tree/"
        },
        {
          "title": "Binary Tree Maximum Path Sum",
          "leetcode_url": "https://leetcode.com/problems/binary-tree-maximum-path-sum/"
        }
      ],
      "Ancestor problem": [
        {
          "title": "LCA of Binary Tree",
          "leetcode_url": "https://leetcode.com/problems/lca-of-binary-tree/"
        },
        {
          "title": "Maximum difference between node and ancestor",
          "leetcode_url": "https://leetcode.com/problems/maximum-difference-between-node-and-ancestor/"
        },
        {
          "title": "LCA of deepest leaves",
          "leetcode_url": "https://leetcode.com/problems/lca-of-deepest-leaves/"
        },
        {
          "title": "Kth Ancestor of a Tree Node",
          "leetcode_url": "https://leetcode.com/problems/kth-ancestor-of-a-tree-node/"
        }
      ],
      "Binary Search Tree": [
        {
          "title": "Validate BST",
          "leetcode_url": "https://leetcode.com/problems/validate-bst/"
        },
        {
          "title": "Range Sum of BST",
          "leetcode_url": "https://leetcode.com/problems/range-sum-of-bst/"
        },
        {
          "title": "Minimum Absolute Difference in BST",
          "leetcode_url": "https://leetcode.com/problems/minimum-absolute-difference-in-bst/"
        },
        {
          "title": "Insert into a BST",
          "leetcode_url": "https://leetcode.com/problems/insert-into-a-bst/"
        },
        {
          "title": "LCA of BST",
          "leetcode_url": "https://leetcode.com/problems/lca-of-bst/"
        }
      ]
    }
  },
  {
    "name": "Dynamic Programming",
    "description": "Optimization problems solved by breaking them into overlapping subproblems.",
    "subgroups": {
      "Take / Not take (DP)": [
        {
          "title": "House Robber II",
          "leetcode_url": "https://leetcode.com/problems/house-robber-ii/"
        },
        {
          "title": "Target Sum",
          "leetcode_url": "https://leetcode.com/problems/target-sum/"
        },
        {
          "title": "Partition Equal Subset Sum",
          "leetcode_url": "https://leetcode.com/problems/partition-equal-subset-sum/"
        },
        {
          "title": "Ones and Zeroes",
          "leetcode_url": "https://leetcode.com/problems/ones-and-zeroes/"
        },
        {
          "title": "Last Stone Weight II",
          "leetcode_url": "https://leetcode.com/problems/last-stone-weight-ii/"
        }
      ],
      "Infinite Supply (DP)": [
        {
          "title": "Coin Change",
          "leetcode_url": "https://leetcode.com/problems/coin-change/"
        },
        {
          "title": "Coin Change II",
          "leetcode_url": "https://leetcode.com/problems/coin-change-ii/"
        },
        {
          "title": "Perfect Squares",
          "leetcode_url": "https://leetcode.com/problems/perfect-squares/"
        },
        {
          "title": "Minimum Cost For Tickets",
          "leetcode_url": "https://leetcode.com/problems/minimum-cost-for-tickets/"
        }
      ],
      "Longest Increasing Subsequence": [
        {
          "title": "Longest Increasing Subsequence",
          "leetcode_url": "https://leetcode.com/problems/longest-increasing-subsequence/"
        },
        {
          "title": "Largest Divisible Subset",
          "leetcode_url": "https://leetcode.com/problems/largest-divisible-subset/"
        },
        {
          "title": "Maximum Length of Pair Chain",
          "leetcode_url": "https://leetcode.com/problems/maximum-length-of-pair-chain/"
        },
        {
          "title": "Number of LIS",
          "leetcode_url": "https://leetcode.com/problems/number-of-lis/"
        },
        {
          "title": "Longest String Chain",
          "leetcode_url": "https://leetcode.com/problems/longest-string-chain/"
        }
      ],
      "DP on Grids": [
        {
          "title": "Unique Paths II",
          "leetcode_url": "https://leetcode.com/problems/unique-paths-ii/"
        },
        {
          "title": "Minimum Path Sum",
          "leetcode_url": "https://leetcode.com/problems/minimum-path-sum/"
        },
        {
          "title": "Triangle",
          "leetcode_url": "https://leetcode.com/problems/triangle/"
        },
        {
          "title": "Minimum Falling Path Sum",
          "leetcode_url": "https://leetcode.com/problems/minimum-falling-path-sum/"
        },
        {
          "title": "Maximal Square",
          "leetcode_url": "https://leetcode.com/problems/maximal-square/"
        },
        {
          "title": "Cherry Pickup",
          "leetcode_url": "https://leetcode.com/problems/cherry-pickup/"
        },
        {
          "title": "Dungeon Game",
          "leetcode_url": "https://leetcode.com/problems/dungeon-game/"
        }
      ],
      "DP on Strings": [
        {
          "title": "Longest Common Subsequence",
          "leetcode_url": "https://leetcode.com/problems/longest-common-subsequence/"
        },
        {
          "title": "Longest Palindromic Subsequence",
          "leetcode_url": "https://leetcode.com/problems/longest-palindromic-subsequence/"
        },
        {
          "title": "Palindromic Substrings",
          "leetcode_url": "https://leetcode.com/problems/palindromic-substrings/"
        },
        {
          "title": "Longest Palindromic Substring",
          "leetcode_url": "https://leetcode.com/problems/longest-palindromic-substring/"
        },
        {
          "title": "Edit Distance",
          "leetcode_url": "https://leetcode.com/problems/edit-distance/"
        },
        {
          "title": "Minimum ASCII Delete Sum for Two Strings",
          "leetcode_url": "https://leetcode.com/problems/minimum-ascii-delete-sum-for-two-strings/"
        },
        {
          "title": "Distinct Subsequences",
          "leetcode_url": "https://leetcode.com/problems/distinct-subsequences/"
        },
        {
          "title": "Shortest Common Supersequence",
          "leetcode_url": "https://leetcode.com/problems/shortest-common-supersequence/"
        },
        {
          "title": "Wildcard Matching",
          "leetcode_url": "https://leetcode.com/problems/wildcard-matching/"
        }
      ],
      "DP on Stocks": [
        {
          "title": "Best Time to Buy and Sell Stock II",
          "leetcode_url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/"
        },
        {
          "title": "Best Time to Buy and Sell Stock III",
          "leetcode_url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/"
        },
        {
          "title": "Best Time to Buy and Sell Stock IV",
          "leetcode_url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/"
        },
        {
          "title": "Best Time to Buy and Sell Stock with Cooldown",
          "leetcode_url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/"
        },
        {
          "title": "Best Time to Buy and Sell Stock with Transaction Fee",
          "leetcode_url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/"
        }
      ],
      "Partition DP (MCM)": [
        {
          "title": "Partition Array for Maximum Sum",
          "leetcode_url": "https://leetcode.com/problems/partition-array-for-maximum-sum/"
        },
        {
          "title": "Burst Balloons",
          "leetcode_url": "https://leetcode.com/problems/burst-balloons/"
        },
        {
          "title": "Minimum Cost to Cut a Stick",
          "leetcode_url": "https://leetcode.com/problems/minimum-cost-to-cut-a-stick/"
        },
        {
          "title": "Palindrome Partitioning II",
          "leetcode_url": "https://leetcode.com/problems/palindrome-partitioning-ii/"
        }
      ]
    }
  },
  {
    "name": "Graphs",
    "description": "Dependency resolution, connectivity, and shortest-path problems on graphs.",
    "subgroups": {
      "Topological Sort": [
        {
          "title": "Course Schedule",
          "leetcode_url": "https://leetcode.com/problems/course-schedule/"
        },
        {
          "title": "Course Schedule II",
          "leetcode_url": "https://leetcode.com/problems/course-schedule-ii/"
        },
        {
          "title": "Strange Printer II",
          "leetcode_url": "https://leetcode.com/problems/strange-printer-ii/"
        },
        {
          "title": "Sequence Reconstruction",
          "leetcode_url": "https://leetcode.com/problems/sequence-reconstruction/"
        },
        {
          "title": "Alien Dictionary",
          "leetcode_url": "https://leetcode.com/problems/alien-dictionary/"
        }
      ],
      "Union Find (Disjoint Set)": [
        {
          "title": "Number of Operations to Make Network Connected",
          "leetcode_url": "https://leetcode.com/problems/number-of-operations-to-make-network-connected/"
        },
        {
          "title": "Redundant Connection",
          "leetcode_url": "https://leetcode.com/problems/redundant-connection/"
        },
        {
          "title": "Accounts Merge",
          "leetcode_url": "https://leetcode.com/problems/accounts-merge/"
        },
        {
          "title": "Satisfiability of Equality Equations",
          "leetcode_url": "https://leetcode.com/problems/satisfiability-of-equality-equations/"
        }
      ],
      "Graph Algorithms": [
        {
          "title": "Minimum Cost to connect all Points",
          "leetcode_url": "https://leetcode.com/problems/minimum-cost-to-connect-all-points/"
        },
        {
          "title": "Cheapest Flights Within K Stops",
          "leetcode_url": "https://leetcode.com/problems/cheapest-flights-within-k-stops/"
        },
        {
          "title": "Find the City with Smallest Number of Neighbours at a Threshold Distance",
          "leetcode_url": "https://leetcode.com/problems/find-the-city-with-smallest-number-of-neighbours-at-a-threshold-distance/"
        },
        {
          "title": "Network Delay time",
          "leetcode_url": "https://leetcode.com/problems/network-delay-time/"
        }
      ]
    }
  },
  {
    "name": "Greedy",
    "description": "Greedy algorithms make local optimal choices at each step, which lead to a global optimal solution for problems like scheduling and resource allocation.",
    "problems": [
      {
        "title": "Jump Game II",
        "leetcode_url": "https://leetcode.com/problems/jump-game-ii/"
      },
      {
        "title": "Gas Station",
        "leetcode_url": "https://leetcode.com/problems/gas-station/"
      },
      {
        "title": "Bag of Tokens",
        "leetcode_url": "https://leetcode.com/problems/bag-of-tokens/"
      },
      {
        "title": "Boats to Save People",
        "leetcode_url": "https://leetcode.com/problems/boats-to-save-people/"
      },
      {
        "title": "Wiggle Subsequence",
        "leetcode_url": "https://leetcode.com/problems/wiggle-subsequence/"
      },
      {
        "title": "Car Pooling",
        "leetcode_url": "https://leetcode.com/problems/car-pooling/"
      },
      {
        "title": "Candy",
        "leetcode_url": "https://leetcode.com/problems/candy/"
      }
    ]
  },
  {
    "name": "Design Data Structure",
    "description": "Building custom data structures to efficiently handle specific operations like access, updates, and memory usage.",
    "problems": [
      {
        "title": "Design Twitter",
        "leetcode_url": "https://leetcode.com/problems/design-twitter/"
      },
      {
        "title": "Design Browser History",
        "leetcode_url": "https://leetcode.com/problems/design-browser-history/"
      },
      {
        "title": "Design Circular Deque",
        "leetcode_url": "https://leetcode.com/problems/design-circular-deque/"
      },
      {
        "title": "Snapshot Array",
        "leetcode_url": "https://leetcode.com/problems/snapshot-array/"
      },
      {
        "title": "LRU Cache",
        "leetcode_url": "https://leetcode.com/problems/lru-cache/"
      },
      {
        "title": "LFU Cache",
        "leetcode_url": "https://leetcode.com/problems/lfu-cache/"
      }
    ]
  }
]
