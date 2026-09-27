@@@
	import { gap, problem as p, problemNumberNextRange as next, problemNumberPreviousRange as prev, problemNumberRange as range } from "../../../../../build/spruce.js";

	function document(body)
	{
		return body;
	}
@@@

# Homework 8

*Due Wednesday of Week 10 at the start of class*

Complete the following problems and submit them as a pdf to Canvas. 8 points are awarded for thoroughly attempting every problem, and I'll select three problems to grade on correctness for 4 points each. Enough work should be shown that there is no question about the mathematical process used to obtain your answers.

@gap

In problems @next(5), do the following:

+ Find the eigenvalues of $A$.

+ Find the corresponding eigenvectors and generalized eigenvectors of $A$.

+ Determine if $A$ is diagonalizable. If it is, write $A = BDB^{-1}$ for a diagonal matrix $D$, and if not, write $A = BJB^{-1}$ for a matrix $J$ in Jordan normal form (you don't need to invert $B$).

+ If $A$ is diagonalizable, determine if there is an orthonormal basis of eigenvectors; if so, find it.

+ If the eigenvalues of $A$ are distinct, find the general solution to the system of differential equations $\vec{x}' = A\vec{x}$.

@p[$A = [[ 3, 1 ; -1, 1 ]]$.]

@p[$A = [[ 2, 1, 0 ; 0, 1, 0 ; 1, -1, 3 ]]$.]

@p[$A = [[ -3, -1, -3 ; -8, -3, -8 ; 4, 1, 3 ]]$.]

@p[$A = [[ -9, -10, -10 ; 4, 4, 3 ; 1, 2, 3 ]]$.]

@p[$A = [[ 1, 3, 0, 0 ; 3, 1, 0, 0 ; 0, 0, 1, -3 ; 0, 0, -3, 1 ]]$.]

@gap

In problems @next(3), do the following:

+ Find a singular value decomposition $A = U \Sigma V^T$.

+ Find a least-squares solution to $A\vec{x} = \vec{b}$.

+ Determine if the least-squares solution is unique.

@p[$A = [[ 1, 2 ; 2, 1 ; 1, 1 ]]$ and $\vec{b} = [[ 1 ; 2 ; 2 ]]$.]

@p[$A = [[ 3, 1, 4 ; 2, 0, 1 ]]$ and $\vec{b} = [[ 1 ; -2 ]]$.]

@p[$A = [[ 1, -1, 0 ; 1, 0, 1 ; 2, -1, 1 ]]$ and $\vec{b} = [[ 1 ; 2 ; -1 ]]$.]

@gap

In problems @next(3), do the following:

+ Find an orthonormal basis for the given inner product space $X$, and then extend it to an orthonormal basis for $V$.

+ Find the orthogonal decomposition of the vector $\vec{v}$ as $\vec{v} = \vec{x} + \vec{x}'$ for $\vec{x} \in X$ and $\vec{x}' \in X^\perp$.

@p[$V = #R#^3$ with $\left< \vec{v}, \vec{w} \right> = \vec{v} \bullet \vec{w}$, $X = \span\left\{ [[ 1 ; 2 ; 0 ]], [[ -1 ; 3 ; 1 ]] \right\}$, and $\vec{v} = [[ 4 ; 5 ; 2 ]]$.]

@p[$V = \span\left\{ 1, x, x^2 \right\}$ with $\left< p, q \right> = \sum_{n = 0}^2 p(n)q(n)$, $X$ is the subspace of polynomials $p$ with $p'(0) = 0$, and $\vec{v} = 1 + 2x + x^2$.]

@p[$V = \span\left\{ 1, \cos(x) \right\}$ with $\left< f, g \right> = \int_0^{\pi/2} f(x)g(x)\,\d x$, $X = \span\{1\}$, and $\vec{v} = \cos(x) - 2$.]