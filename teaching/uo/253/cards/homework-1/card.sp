@@@
	import { controls, gap, problem as p, problemNumberNextRange as next, problemNumberPreviousRange as prev, problemNumberRange as range } from "../../../../../scripts/src/spruce.js";

	function document(body)
	{
		return body;
	}
@@@

# Homework 1

*Due Wednesday of Week 2 at the start of class*

Complete the following problems and submit them as a pdf to Canvas. 8 points are awarded for thoroughly attempting every problem, and I'll select three problems to grade on correctness for 4 points each. Enough work should be shown that there is no question about the mathematical process used to obtain your answers. 

@controls({
	downloadHomework1Tex: "button"
})

@gap

In problems @next(6), write the first five terms of the sequence and find an explicit formula for the $n$th term of the sequence if it is not already given.

@p[$$a_n = \left( \frac{1}{2} \right)^n$$.]

@p[$$b_n = \cos\left( \frac{\pi}{2} n \right)$$.]

@p[$$c_1 = 1$$ and $$c_n = nc_{n - 1}$$ for $n \geq 2$.]

@p[$$d_1 = \frac{1}{5}$$, $$d_2 = \frac{1}{5}$$, and $d_n = d_{n - 1}d_{n - 2}$ for $n \geq 3$. (You may state your explicit formula in terms of another sequence).]

@p[$e_1 = 6$, $e_2 = 2$, and $(e_n)$ is an arithmetic sequence.]

@p[$f_1 = 6$, $f_2 = 2$, and $(f_n)$ is a geometric sequence.]

@p[For each of the sequences in problems @prev(6), find the limit if it exists. If it does exist, find a positive integer $N$ so that all terms of the sequence with index at least $N$ are within $\varepsilon = 0.1$ of the limit.]

@gap

In problems @next(5), determine if the sequence converges and find the limit of the sequence if it does. Justify your answers.

@p[$$a_n = \frac{3n^3 - 2n^2}{n^3 + 1}$$.]

@p[$$b_n = \frac{(-1)^n}{\sqrt{n}}$$.]

@p[$$c_n = \tan(n)$$.]

@p[$$d_n = \frac{2^n}{n!}$$.]

@p[$$e_n = \frac{n^n}{n!}$$.]

@gap

@p[Give an example of a sequence that is monotone increasing that does not converge, and a sequence that is bounded below but does not converge.]

@p[If a sequence is not bounded above, can it converge? Explain.]

@p[If a sequence $a_n$ has infinitely many positive terms *and* infinitely many negative terms, can it still converge? If so, are there restrictions on what it can converge to?]

@p[Suppose $(a_n)$ is a sequence of rational numbers with $(a_n) \to a$. Is $a$ necessarily a rational number?]

@p[Let $a_n$ be a sequence and let $b_n = \left| a_{n + 1} - a_n \right|$. If $(b_n) \to 0$, does $(a_n)$ have to converge?]