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



## Section 8

In problems @next(6), find **two different** bases $\mathcal{B}$ and $\mathcal{C}$ for the vector space $V$ and use them to find $\dim V$. Then with the given vector $\vec{v}$, find $[\vec{v}]_\mathcal{C}$.

@p[$V = #R#^3$, and $\vec{v} = [[ 1 ; 2 ; 3 ]]$.]

@p[$V = M_{2 \times 2}(#R#)$, and $\vec{v} = [[ 2, -1 ; 0, 1 ]]$.]

@p[$V = \mathcal{L}(#R#^2, #R#^2)$, and $\vec{v}:#R#^2 \to #R#^2$ is defined by $\vec{v}\left( [[ x ; y ]] \right) = [[ 2x ; x + y ]]$. (Hint: your answers to the previous problem may help.)]

@p[$V$ is the subspace of $#R#^4$ of vectors $[[ x ; y ; z ; w ]]$ satisfying $x + y - w = 0$, and $\vec{v} = [[ 1 ; 1 ; 3 ; 2 ]]$.]

@p[$V = #R#[x]$, and $\vec{v} = (x^2 - 2)^2$.]

@p[$V = \span\{\cos(x), \sin(x)\}$, and $\vec{v} = \sin\left(x + \frac{\pi}{4} \right)$. (Hint: the sum and difference formulas for $\sin$ and $\cos$ may be helpful.)]

@gap

In problems @next(3), find a matrix for the linear transformation $T : V \to W$ by choosing bases $\mathcal{B}$ for $V$ and $\mathcal{C}$ for $W$. Then use the matrix to evaluate $T(\vec{v})$ for the given vector $v$.

@p[$V = #R#^3$ and $W = #R#$, $T: V \to W$ is a transformation for which]

$$
	T\left( [[ 1 ; 0 ; 1 ]] \right) = 1 \qquad T\left( [[ 2 ; 0 ; 1 ]] \right) = 2 \qquad T\left( [[ 0 ; -1 ; 0 ]] \right) = -1,
$$

and $\vec{v} = [[ 1 ; 1 ; 1 ]]$.

@p[$V$ and $W$ are both the subspace of $#R#[x]$ of polynomials with degree at most $2$, $T: V \to W$ is a transformation for which]

$$
	T(1) = x \qquad T(x^2 + x) = 2x \qquad T(x^2) = x^2,
$$

and $\vec{v} = x^2 - x - 1$.

@p[$V = M_{2 \times 2}(#R#)$, $W = #R#^2$, $T: V \to W$ is a transformation for which]

$$
	T\left([[ 1, 0 ; 0, 1 ]]\right) = [[ 2 ; 0 ]] \qquad T\left([[ 0, 1 ; 1, 0 ]]\right) = [[ 0 ; 2 ]] \qquad T\left([[ 1, 1 ; 0, 0 ]]\right) = [[ 1 ; 1 ]] \qquad T\left([[ 0, 0 ; 0, 1 ]]\right) = [[ 1 ; 0 ]],
$$

and $\vec{v} = [[ 1, 2 ; 3, 4 ]]$.