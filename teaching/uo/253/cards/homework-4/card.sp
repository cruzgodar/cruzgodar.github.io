@@@
	import { controls, gap, problem as p, problemNumberNextRange as next, problemNumberPreviousRange as prev, problemNumberRange as range } from "../../../../../build/spruce.js";

	function document(body)
	{
		return body;
	}
@@@

# Homework 4

*Due Wednesday of Week 5 at the start of class*

Complete the following problems and submit them as a pdf to Canvas. 8 points are awarded for thoroughly attempting every problem, and I'll select three problems to grade on correctness for 4 points each. Enough work should be shown that there is no question about the mathematical process used to obtain your answers.

@gap

In problems @next(8), determine if the series converges or diverges.

@p[$$\sum_{n = 1}^\infty \frac{1}{n^2 + \ln(n)}$$.]

@p[$$\sum_{k = 2}^\infty \frac{1}{k^2 - k - 1}$$.]

@p[$$\sum_{m = 3}^\infty \frac{m}{m^2 - 8}$$.]

@p[$$\sum_{n = 1}^\infty \frac{\ln(n)}{n^2 + 2}$$.]

@p[$$\sum_{m = 1}^\infty \frac{\sin(m) + 1}{m^{1.5}}$$.]

@p[$$\sum_{n = 1}^\infty \frac{1}{\sqrt{n^2 + \ln(n)}}$$ (Hint: factor out an $n$ from the root).]

@p[$$\sum_{n = 2}^\infty \frac{1}{n\ln(n)\ln(\ln(n))}$$.]

@p[$$\sum_{n = 1}^\infty \frac{\ln^k(n)}{n^2}$$ for $k \geq 1$ any positive integer. Here, $\ln^k(n) = \left( \ln(n) \right)^k$. (Hint: use the limit comparison test with $\frac{1}{n^{1.5}}$.)]

@gap

@p[Give an example of a divergent series $\sum_{n = 1}^\infty a_n$ so that $a_n \leq \frac{1}{n^2}$ for all $n$. Why does this not contradict the comparison test?]

@p[If $a_n \geq 0$ and $$\lim_{n \to \infty} \frac{a_n}{1/n} = 0$$, can $\sum_{n = 1}^\infty a_n$ still diverge?]