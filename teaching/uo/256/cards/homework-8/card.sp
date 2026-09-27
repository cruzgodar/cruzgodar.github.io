@@@
	import { gap, problem as p, problemNumber, problemNumberNextRange as next, problemNumberPreviousRange as prev, problemNumberRange as range } from "../../../../../build/spruce.js";

	function document(body)
	{
		return body;
	}
@@@

# Homework 8

*Due Wednesday of Week 9 at the start of class*

Complete the following problems and submit them as a pdf to Canvas. 8 points are awarded for thoroughly attempting every problem, and I'll select three problems to grade on correctness for 4 points each. Enough work should be shown that there is no question about the mathematical process used to obtain your answers.



## Section 10

In problems @next(5), find the determinant of the given matrix.

@p[$$**A** = [[2, -1 ; 3, -2]].$$]

@p[$$**B** = [[1, -1 ; 1, 3]].$$]

@p[$$**C** = [[19, -4, 8 ; -8, 5, -10 ; -1, -2, 4]].$$]

@p[$$**D** = [[2, 2, -2 ; -3, 7, 3 ; -5, 5, 5]].$$]

@p[$$**E** = [[5, 6, 4, -4 ; 3, 8, -2, 2 ; 3, -3, 9, 2 ; 0, 0, 0, 11]].$$]

@gap

In problems @next(5), find the eigenvalues and eigenvectors of the given matrix, and verify that the product of the eigenvalues is the determinant you found before.

@p[$**A**$ from problem @problemNumber(-5).]

@p[$**B**$ from problem @problemNumber(-5).]

@p[$**C**$ from problem @problemNumber(-5).]

@p[$**D**$ from problem @problemNumber(-5).]

@p[$**E**$ from problem @problemNumber(-5). Hint: you may it useful to know that $(x - 11)^3 = x^3 - 33x^2 + 363x - 1331$.]

@gap

@p[With $**A**$ from problem 1, find the following:]

+ $$**A**^{100} [[1 ; 3]].$$

+ $$**A**^{100} [[-2 ; -6]].$$

+ $$**A**^{100} [[0 ; -4]].$$

@gap

@p[A remarkable property of the determinant is that it's **multiplicative**: for any two $n \times n$ matrices $**A**$ and $**B**$, $\det (**AB**) = \left( \det **A** \right)\left( \det **B** \right)$. Use this property to answer the following questions.]

+ What is $\det **I**$? Hint: $**IA** = **A**$ for any matrix $**A**$ for which the product makes sense.

+ Let $**A**$ be an invertible matrix. What is $\det \left(**A**^{-1}\right)$ in terms of $\det **A**$?

@gap

@p[Suppose $**A**$ is an invertible matrix with eigenvectors $**v_1**, ..., **v_n**$ with corresponding eigenvalues $\lambda_1, ..., \lambda_n$.]

+ For $**A**$ to be invertible, none of the $\lambda_i$ can be zero. Why is this?

+ What are the eigenvectors and eigenvalues of $**A**^{-1}$? Hint: start with $**Av_i** = \lambda_i **v_i**$ and find a way to introduce $**A**^{-1}$ into the equation.