@@@
	import { gap, problem as p, problemNumberNextRange as next, problemNumberPreviousRange as prev, problemNumberRange as range } from "../../../../../build/spruce.js";

	function document(body)
	{
		return body;
	}
@@@

# Homework 8

*Due Monday, November 10th at 11:59 PM*

Complete the following problems and submit them as a pdf to Gradescope. You should show enough work that there is no question about the mathematical process used to obtain your answers, and so that your peers in the class could easily follow along. I encourage you to collaborate with your classmates, so long as you write up your solutions independently. If you collaborate with any classmates, please include a statement on your assignment acknowledging with whom you collaborated.

On this homework, please do row reduction by hand. However, please do check your answers with technology for all of the problems! I recommend [Wolfram Alpha](https://www.wolframalpha.com/) for this purpose, where you can ask questions of the form "Row reduce {{1, 2, 3}, {4, 5, 6}}" to row reduce the matrix

$$
	[[ 1, 2, 3 ; 4, 5, 6 ]].
$$

@gap

In problems @next(4), write the system as an augmented matrix and row reduce it, indicating every elementary row operation you perform. Then use the reduced matrix to write the solution to the system.

@p[]

$$
	3x - y &= 14
	
	4x + 2y &= 2.
$$

@p[]

$$
	x + 2z &= 8
	
	-x + 2y + 6z &= 6
	
	4x + y + 3z &= 21.
$$

@p[]

$$
	x_1 + x_2 - 4x_3 &= -11
	
	-3x_1 + 2x_3 &= 3
	
	2x_1 + 2x_2 + 2x_3 &= 8
	
	-x_1 + 2x_2 &= 1.
$$

@p[]

$$
	a + c &= 2
	
	b + d &= 1
	
	a + 2b + 3c + 4d &= 10
	
	4a + 3b + 2c + d &= 5.
$$

@gap

In problems @next(4), invert the matrix.

@p[$$[[4, 1 ; -1, 2]].$$]

@p[$$[[1, 0, -1 ; 4, 5, 6 ; 0, -1, 2]].$$]

@p[$$[[2, 1, 3 ; 3, -1, 2 ; 1, 0, 1]].$$]

@p[$$[[4]].$$]

@gap

@p[Let's investigate the elementary row operations a bit more. For a $3 \times 3$ matrix $A$, find the following:]

+ A matrix $S$ so that $SA$ is the equal to $A$, but with rows $1$ and $2$ swapped.

+ A matrix $M_c$ so that $MA$ is same as $A$, but with row $1$ multiplied by $c$.

+ A matrix $P_c$ so that $P_cA$ is same as $A$, but with $c$ times row $2$ added to row $1$.

We call these types of matrices (those that swap two rows, those that multiply a row by a number, and those that add a multiple of one row to another) **elementary matrices**.

@p[Let $A$ be an invertible $3 \times 3$ matrix. Explain why there is a sequence of elementary matrices that we can multiply $A$ by in order to make $I$.]

@p[Let $B$ be the product of that sequence of elementary matrices in question #-1. Explain why $B = A^{-1}$ and why that means that our row reduction process to find the inverse of $A$ works.]

@gap

@p[Let $$A = [[a, b ; c, d]]$$ be a generic $2 \times 2$ matrix. Use row reduction to find a formula for $A^{-1}$ in terms of $a$, $b$, $c$, and $d$. What condition does this enforce on $a$, $b$, $c$, and $d$?]