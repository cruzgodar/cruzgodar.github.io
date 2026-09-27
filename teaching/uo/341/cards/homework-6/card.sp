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



## Section 7

In problems @next(5), determine if the set $X$ is a subspace of the vector space $V$. If it is, show that $X$ is closed under addition and scalar multiplication and contains the zero vector, and if not, give an example showing one of those three fails.

@p[$X$ is the set of vectors of the form $[[ x ; y ; 1 ]]$ for real numbers $x$ and $y$, and $V = #R#^3$.]

@p[$X = \span \{ \cos(x), \sin(x) \}$, and $V = C^0(#R#)$.]

@p[$X$ is the set of matrices of the form $[[ a, 0 ; 0, b ]]$, and $V = M_{2 \times 2}(#R#)$.]

@p[$X$ is the set of linear transformations $T : #R#^2 \to #R#^2$ such that $T \left( [[ 1 ; 1 ]] \right) = [[ 1 ; 1 ]]$, and $V = \mathcal{L}(#R#^2, #R#^2)$.]

@p[$X$ is the set of linear transformations $T : #R#^3 \to #R#^2$ with]

$$
	\ker T = \span\left\{ [[ 1 ; 1 ; 0 ]], [[ 0 ; 0 ; 1 ]] \right\},
$$

and $V = \mathcal{L}(#R#^3, #R#^2)$.

@gap

In problems @next(5), determine if the given function $T$ is a linear transformation. If it is, show that $T$ splits across addition and scalar multiplication, and if it is not, give an example showing one of those two things fails. If $T$ is a linear transformation, also find $\ker T$ and write it as a span of vectors.

@p[$T : #R#^3 \to #R#^2$, defined by]

$$
	T \left( [[ x ; y ; z ]] \right) = [[ x + y + z ; 2x - y - z ]].
$$

@p[$T : #R#[x] \to #R#[x]$ given by $T(p(x)) = p''(x)$.]

@p[$T : #R#^#R# \to #R#$ given by $T(f) = f(0)$. In this problem, just describe the kernel in words rather than as a span.]

@p[$T : M_{2 \times 2}(#R#) \to #R#$ given by $T(A) = \det A$.]

@p[$T : \mathcal{L}(#R#^2, #R#^2) \to #R#^2$ given by $T(S) = S\left( [[ 1 ; 1 ]] \right)$.]