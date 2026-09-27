@@@
	import { gap, problem as p, problemNumberNextRange as next, problemNumberPreviousRange as prev, problemNumberRange as range } from "../../../../../build/spruce.js";

	function document(body)
	{
		return body;
	}
@@@

# Homework 6

*Due Wednesday of Week 7 at the start of class*

Complete the following problems and submit them as a pdf to Canvas. 8 points are awarded for thoroughly attempting every problem, and I'll select three problems to grade on correctness for 4 points each. Enough work should be shown that there is no question about the mathematical process used to obtain your answers.

## Section 8

In problems @next(5), evaluate the product.

@p[$$[[3, 0 ; 6, -2]][[1 ; -1]].$$]

@p[$$[[1, 2, 3]][[4 ; 5 ; 6]].$$]

@p[$$[[4 ; 5 ; 6]][[1, 2, 3]].$$]

@p[$$[[1 ; 2 ; 3]][[4 ; 5 ; 6]].$$]

@p[$$[[1, 0 ; 0, 1 ; 1, 1]][[1, -1, 1, -1 ; -1, 1, -1, 1]].$$]

@gap

@p[Suppose that for a square matrix $**A**$, there are matrices $**B**$ and $**C**$ so that $**AB** = **I**$ and $**CA** = **I**$. Show that it must be the case that $**B** = **C**$. Hint: multiply both sides of the second equation by something.]

@gap

@p[Let $A$ be an $n \times n$ matrix with entries $a_{ij}$.]

+ For the products $AI$ and $IA$ to make sense, what dimension must $I$ have?

+ The $i$th row of $A$ is $[[a_{i1}, a_{i2}, \cdots, a_{in}]]$. If the $j$th column of $I$ is denoted $\vec{e_j}$, what is the entry in row $i$ and column $j$ of $AI$? Your answer should be in terms of $i$ and $j$.

+ What does part b) imply $AI$ is equal to? Why does this make sense in the context of function composition?