@@@
	import { gap, problem as p, problemNumberNextRange as next, problemNumberPreviousRange as prev, problemNumberRange as range } from "../../../../../build/spruce.js";

	function document(body)
	{
		return body;
	}
@@@

# Homework 5

*Due Wednesday of Week 6 at the start of class*

Complete the following problems and submit them as a pdf to Canvas. 8 points are awarded for thoroughly attempting every problem, and I'll select three problems to grade on correctness for 4 points each. Enough work should be shown that there is no question about the mathematical process used to obtain your answers.



## Section 4

In problems @next(3), use the Gram-Schmidt process to produce an orthonormal basis for the given subspace $X$. Then find the orthogonal decomposition of given vector $\vec{v}$ as $\vec{v} = \vec{x} + \vec{x}'$ for $\vec{x} \in X$ and $\vec{x'} \in X^\perp$.

@p[$X = \span\left\{ [[ 1 ; 2 ; 0 ]], [[ -1 ; 1 ; 4 ]] \right\}$ and $\vec{v} = [[ 1 ; 2 ; 3 ]]$.]

@p[$X = \span\left\{ [[ 2 ; -4 ; 1 ; 3 ]], [[ 1 ; 1 ; 1 ; 2 ]], [[ 0 ; 1 ; 2 ; 6 ]] \right\}$ and $\vec{v} = [[ -1 ; 1 ; 0 ; 3 ]]$.]

@p[$X = \span\left\{ [[ 0 ; 1 ; 0 ; 1 ]], [[ 1 ; 1 ; 0 ; 0 ]]\right\}$ and $\vec{v} = [[ -1 ; 1 ; 0 ; 3 ]]$.]

@gap

In problems @next(2), find the closest vector $\vec{x} \in X$ to $\vec{v}$, and compute the distance between the two.

@p[$X = \span\left\{ [[ 1 ; 2 ; 2 ]] \right\}$ and $\vec{v} = [[ 3 ; 1 ; 4 ]]$.]

@p[$X = \span\left\{ [[ 4 ; 2 ; 1 ]], [[ -1 ; -1 ; 1 ]] \right\}$ and $\vec{v} = [[ 1 ; 0 ; 0 ]]$.]

@gap

@p[Let $A = [[ 1, -1 ; 2, 1 ; 0, 4 ]]$ be the matrix whose columns are the basis vectors from problem 1. By using the data from the Gram-Schmidt process, write $A = QR$ for a $3 \times 2$ unitary matrix $Q$ and a $2 \times 2$ upper triangular matrix $R$ whose eigenvalues are all positive. This is known as a **$\mathbf{QR}$ factorization** of $A$ --- write a brief sentence explaining why this is always possible for a matrix with linearly independent columns.]

@p[Find a $QR$ factorization of $A = [[ 2, 1, 0 ; -4, 1, 1 ; 1, 1, 2 ; 3, 2, 6 ]]$.]

@p[Find a $QR$ factorization of $A = [[ 0, 1 ; 1, 1 ; 0, 0 ; 1, 0 ]]$.]

@gap

@p[Let $X$ be a subspace of $#R#^n$. What is the kernel of the map $\proj_X$? (This should be a brief answer.)]

@p[True or false: for any subspace $X$ of $#R#^n$ and any $\vec{v} \in #R#^n$, $\left| \left| \proj_X\left( \vec{v} \right) \right| \right| \leq \left| \left| \vec{v} \right| \right|$. If true, briefly explain why, and if not, provide a short counterexample.]