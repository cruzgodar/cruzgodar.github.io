@@@
	import { gap, problem as p, problemNumberNextRange as next, problemNumberPreviousRange as prev, problemNumberRange as range } from "../../../../../build/spruce.js";

	function document(body)
	{
		return body;
	}
@@@

# Homework 6

*Due Monday, October 27th at 11:59 PM*

Complete the following problems and submit them as a pdf to Gradescope. You should show enough work that there is no question about the mathematical process used to obtain your answers, and so that your peers in the class could easily follow along. I encourage you to collaborate with your classmates, so long as you write up your solutions independently. If you collaborate with any classmates, please include a statement on your assignment acknowledging with whom you collaborated.


@gap

In problems @next(2), write the system in the form $A\vec{x} = \vec{b}$ for a matrix $A$ and vector $\vec{b}$ of constants and a vector $\vec{x}$ of variables.

@p[]

$$
	x_1 &= 2

	2x_1 - x_2 &= 3.
$$

@p[]

$$
	2x_3 - x_2 &= 0

	x_1 &= x_3 - x_2 + 1
$$



@gap

In problems @next(5), evaluate the product or explain why it is undefined.

@p[$$[[3, 0 ; 6, -2]][[1 ; -1]].$$]

@p[$$[[1, 2, 3]][[4 ; 5 ; 6]].$$]

@p[$$[[4 ; 5 ; 6]][[1, 2, 3]].$$]

@p[$$[[1 ; 2 ; 3]][[4 ; 5 ; 6]].$$]

@p[$$[[1, 0 ; 0, 1 ; 1, 1]][[1, -1, 1, -1 ; -1, 1, -1, 1]].$$]



@gap

@p[State whether each part is true or false. If true, briefly justify why, and if false, provide a small counterexample.]

+ A system with $3$ equations and $2$ unknowns always has at least one solution.

+ If the product $AB$ is defined, then $A$ and $B$ have the same number of rows.

+ If $A$ is a $2 \times 2$ matrix so that $A\vec{x} = \vec{x}$ for *every* vector $\vec{x}$, then $A = I_2$. Hint: try plugging in specific values of $x_1$ and $x_2$, like $0$ and $1$.

@gap

In problems @next(3), we'll show that many of the nice properties of multiplication of numbers don't hold for matrices.

@p[(Matrix multiplication isn't commutative) With real numbers $x$ and $y$, it must be the case that $xy = yx$, but this isn't true with matrices. Define matrices $A$ and $B$ by]

$$
	A = [[1, 2, 3 ; 4, 5, 6 ; 7, 8, 9]], \quad B = [[1, 0, 2 ; -2, 3, 0 ; 0, 4, 1]]
$$

Compute $AB$ and $BA$ and show that they're different.

@p[(Matrix multiplication doesn't cancel) With real numbers $x$, $y$, and $z$ where $x \neq 0$ and $xy = xz$, it's always the case that $y = z$, but this also isn't true for matrices. Define matrices $A$, $B$, and $C$ by]

$$
	A = [[1, 2 ; 0, 0]], \quad B = [[1, 2 ; 3, 4]], \quad C = [[5, 4 ; 1, 3]]
$$

Show that $AB = AC$, despite $B \neq C$.

@p[(Matrix multiplication doesn't follow the zero-product rule) With real numbers $x$ and $y$ where $xy = 0$, either $x = 0$ or $y = 0$. Unfortunately, this also isn't the case for matrices. Define $A$ and $B$ by]

$$
	A = [[1, 0, 0 ; 0, 0, 0 ; 0, 0, 0]], \quad B = [[0, 0, 0 ; 0, 2, 3 ; 0, 4, 5]].
$$

Show that $AB = 0$ (the matrix of all zeros), even though both $A$ and $B$ are nonzero.

@gap

@p[How do you feel about this material and these questions? Is there anything in particular that you would like to focus on going forward?]

@p[Choose up to three questions (and at least one) on which you would like detailed feedback.]

@p[Please complete the mid-semester feedback survey in Canvas! Your responses are anonymous, and I would be grateful if everyone provided feedback on how the class is going. For your answer to this question, please just put a checkmark to indicate you've read this (and have hopefully filled out the survey!)]