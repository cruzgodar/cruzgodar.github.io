@@@
	import { gap, problem as p, problemNumberNextRange as next, problemNumberPreviousRange as prev, problemNumberRange as range } from "../../../../../build/spruce.js";

	function document(body)
	{
		return body;
	}
@@@

# Homework 7

*Due Wednesday of Week 8 at the start of class*

Complete the following problems and submit them as a pdf to Canvas. 8 points are awarded for thoroughly attempting every problem, and I'll select three problems to grade on correctness for 4 points each. Enough work should be shown that there is no question about the mathematical process used to obtain your answers.



## Section 7

@p[Let $A$ be a real $m \times n$ matrix. Explain why $A^T\!A$ is guaranteed to be diagonalizable.]

@p[Let $A$ be a symmetric (i.e. $A^T = A$), $n \times n$, real matrix with all positive eigenvalues and define $\left< \vec{v}, \vec{w} \right> = \vec{v}^T A \vec{w}$ for $\vec{v}, \vec{w} \in #R#^n$.]

+ Show from the formula that this is symmetric --- that $\left< \vec{v}, \vec{w} \right> = \left< \vec{w}, \vec{v} \right>$.

+ Show that it's also bilinear --- that $\left< c\vec{u} + \vec{v}, \vec{w} \right> = c\left< \vec{u}, \vec{w} \right> + \left< \vec{v}, \vec{w} \right>$.

+ Setting $\vec{v} = \vec{w} = \vec{0}$, we have that $\left< \vec{0}, \vec{0} \right> = 0$. Explain why for any nonzero vector $\vec{v} \in #R#^n$, $\left< \vec{v}, \vec{v} \right> > 0$.

## Section 8

In problems @next(3), write the matrix as $A = BJB^{-1}$ for a matrix $J$ in Jordan normal form.

@p[$A = [[ 0, -5, -2 ; 2, 6, 1 ; -2, -3, 2 ]]$.]

@p[$A = [[ -3, -1, -2 ; -1, -1, -1 ; 2, 1, 1 ]]$.]

@p[$A = [[ 12, 4, 4 ; -24, -8, -8 ; -3, -1, 0 ]]$.]