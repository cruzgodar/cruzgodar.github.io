@@@
	import { gap, problem as p, problemNumberNextRange as next, problemNumberPreviousRange as prev, problemNumberRange as range } from "../../../../../build/spruce.js";

	function document(body)
	{
		return body;
	}
@@@

# Homework 1

*Due Wednesday of Week 2 at the start of class*

Complete the following problems and submit them as a pdf to Canvas. 8 points are awarded for thoroughly attempting every problem, and I'll select three problems to grade on correctness for 4 points each. Enough work should be shown that there is no question about the mathematical process used to obtain your answers.



## Section 0

In problems @next(3), do the following:

+ Write the system of equations in the form $A\vec{x} = \vec{b}$ for a matrix $A$ and a vector $\vec{b}$ of constants, and a vector $\vec{x}$ of variables.

+ Augment $A$ with $\vec{b}$ and row reduce the system to solve for $\vec{x}$.

+ If $A$ is square, find $\det A$.

+ Let $T$ be the linear transformation corresponding to the matrix $A$. Write down the domain and codomain for $T$.

+ Find a basis for $\ker T$ and use it to find a basis for $\image T$ using the Fundamental Theorem of Linear Algebra.

+ Determine if $T$ is one-to-one, onto, both, or neither. If it's both one-to-one and onto, find a formula for $T^{-1}$.

@p[]

$$
	x + y &= 1
	
	x - y &= 3	
$$

@p[]

$$
	x + 2y - z &= -1
	
	2x + 3y - w &= -2
$$

@p[]

$$
	x + y + 2z &= 4
	
	2x + y - z &= 2
	
	-3x - y + 4z &= 0
$$

@gap

In problems @next(4), do the following:

+ The given sets $V$ and $W$ are vector spaces. Determine whether the subset $X$ of $V$ is a subspace. If it is, show it satisfies all three subspace properties, and if not, give a specific example showing one of the properties fails.

+ Determine whether the function $T : V \to W$ is a linear transformation. If it is, show it satisfies the two properties, and if not, give a specific example showing one of them fails.

+ If $T$ is a linear transformation, find the matrix for $T$ with respect to the standard bases for $V$ and $W$.

+ If $T$ is a linear transformation, find a basis for $\ker T$ and use it to find bases for $V$ and $\image T$ using the Fundamental Theorem of Linear Algebra. Then extend the basis for $\image T$ to a basis for $W$, and find the matrix for $T$ with respect to the bases for $V$ and $W$ you found.

@p[$V = #R#^4$, $W = M_{2 \times 2}(#R#)$, $X$ is the set of vectors $[[ x ; y ; z ; w ]] \in #R#^4$ such that $x + 2y = w$, and $T : V \to W$ is defined by]

$$
	T\left( [[ x ; y ; z ; w ]] \right) = [[ 0, x ; y + z, 2w ]].
$$

@p[$V = M_{2 \times 2}(#R#)$, $W = M_{2 \times 2}(#R#)$, $X$ is the set of matrices $A$ such that $\det A = 0$, and $T : V \to W$ is defined by]

$$
	T(A) = A^T,
$$

where $A^T$ is the **transpose** of $A$, defined by $(A^T)_{ij} = A_{ji}$ (it effectively flips $A$ across its diagonal).

@p[$V$ is the space of polynomials with degree at most 3, $W = #R#^2$, $X$ is the set of polynomials $p(x)$ such that $p'(x) = 1$, and $T : V \to W$ is defined by]

$$
	T(a + bx + cx^2 + dx^3) = [[ a + b ; c + d ]].
$$

@p[$V = \mathcal{L}(#R#, #R#^2)$, $W = M_{2 \times 2}(#R#)$, $X$ is the set of linear transformations $S : #R# \to #R#^2$ such that $S(1) = [[ 0 ; 0 ]]$, and $T : V \to W$ is defined by]

$$
	T(S) = [[ \mid, \mid ; S(1), S(-1) ; \mid, \mid ]],
$$

i.e. the outputs of $S$ are placed as columns in a $2 \times 2$ matrix.



## Section 1

In problems @next(3), find the eigenvalues and eigenvectors of the matrix.

@p[$A = [[ 2, -1 ; 3, -2 ]]$.]

@p[$B = [[ -1, 2 ; 0, -3 ]]$.]

@p[$C = [[ 2, 2, -2 ; -3, 7, 3 ; -5, 5, 5 ]]$.]

@gap

@p[Let $A = [a_{ij}]$ be an $n \times n$ matrix that is upper triangular --- that is, $a_{ij} = 0$ whenever $i > j$. What are the eigenvalues of $A$ in terms of the entries $a_{ij}$? Justify your answer.]

@p[Let $A$ be an $n \times n$ matrix with eigenvectors $\vec{v_1}, ..., \vec{v_n}$ and corresponding eigenvalues $\lambda_1, ..., \lambda_n$. If $A$ is invertible, what are the eigenvectors and eigenvalues of $A^{-1}$? Justify your answer.]

@p[Let $A$ be an $n \times n$ matrix with eigenvalues $\lambda_1, ..., \lambda_n$. What are the eigenvalues of $A^T$? Justify your answer.]