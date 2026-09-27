@@@
	import { controls, gap, problem as p, problemNumberNextRange as next, problemNumberPreviousRange as prev, problemNumberRange as range } from "../../../../../build/spruce.js";

	function document(body)
	{
		return body;
	}
@@@

# Homework 5

*Due Wednesday of Week 6 at the start of class*

Complete the following problems and submit them as a pdf to Canvas. 8 points are awarded for thoroughly attempting every problem, and I'll select three problems to grade on correctness for 4 points each. Enough work should be shown that there is no question about the mathematical process used to obtain your answers.

@gap

In problems @next(12), determine if the series converges absolutely, converges conditionally, or diverges. For alternating series that converge, estimate the series to within $0.1$ of its actual value.

@p[$$\sum_{n = 1}^\infty \frac{(-1)^n\ln(n)}{n}$$.]

@p[$$\sum_{k = 2}^\infty \frac{(-1)^{k + 1}}{\ln(\ln(k))}$$.]

@p[$$\sum_{n = 1}^\infty \frac{2^n}{n!}$$.]

@p[$$\sum_{n = 1}^\infty \left( \frac{2n + 1}{3n + 2} \right)^n$$.]

@p[$$\sum_{k = 1}^\infty \frac{(-1)^{k + 1}}{k!}$$.]

@p[$$\sum_{n = 2}^\infty \frac{2^n}{\ln(n)}$$.]

@p[$$\sum_{n = 1}^\infty \frac{(n!)^2}{(2n)!}$$.]

@p[$$\sum_{i = 1}^\infty \frac{\sin(i)}{i\sqrt{i}}$$.]

@p[$$\sum_{n = 1}^\infty \frac{n^2}{2^n}$$.]

@p[$$\sum_{m = 1}^\infty \frac{(-1)^m \sin\left( \frac{1}{m} \right)}{m}$$.]

@p[$$\sum_{n = 1}^\infty (-1)^n \left( 1 - n^{1/n} \right)$$.]

@p[$$\sum_{k = 1}^\infty \left( k^{1/k} - 1 \right)^k$$.]

@gap

The ratio and root tests look pretty similar to one another --- let's see if we can find a relationship between the two.

@p[Let $$\sum_{n = 1}^\infty a_n$$ be a series with positive terms that converges via the ratio test: i.e. $$\lim_{n \to \infty} \frac{a_{n + 1}}{a_n} < 1$$. Therefore, there is a value $r < 1$ so that whenever $n \geq N$ for some $N$, $\frac{a_{n + 1}}{a_n} \leq r$.]

+ Show that when $n \geq N$, $a_n \leq a_N r^{n - N}$.

+ Raise both sides of the inequality to the power of $\frac{1}{n}$ to get $a_n^{1/n} \leq a_N^{1/n} r^{1 - \frac{N}{n}}$. Now take the limit of both sides as $n \to \infty$.

+ What can we conclude about the relationship between the ratio test and the root test?

@p[Let $$a_n = \frac{1}{2^{n + (-1)^{n + 1}}}$$ and consider the sum]

$$
	\sum_{n = 1}^\infty a_n = \frac{1}{2^1} + \frac{1}{2^0} + \frac{1}{2^3} + \frac{1}{2^2} + \frac{1}{2^5} + \frac{1}{2^4} + \frac{1}{2^7} + \frac{1}{2^6} + \cdots.
$$

+ What does the ratio test say about this series? (Hint: treat the cases when $n$ is even and odd separately.)

+ What does the root test say?

+ What can we conclude about the relationship between the ratio test and the root test?