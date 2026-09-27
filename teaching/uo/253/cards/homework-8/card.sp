@@@
	import { controls, gap, problem as p, problemNumberNextRange as next, problemNumberPreviousRange as prev, problemNumberRange as range } from "../../../../../build/spruce.js";

	function document(body)
	{
		return body;
	}
@@@

# Homework 8

*Due Wednesday of Week 10 at the start of class*

Complete the following problems and submit them as a pdf to Canvas. 8 points are awarded for thoroughly attempting every problem, and I'll select three problems to grade on correctness for 4 points each. Enough work should be shown that there is no question about the mathematical process used to obtain your answers.

@gap

In problems @next(5), find a Taylor series for $f(x)$ centered at $x = a$ and determine its interval of convergence.

@p[$$f(x) = \cos(x)$$, $$a = 0$$.]

@p[$$f(x) = \sin(2x)$$, $$a = \frac{\pi}{2}$$.]

@p[$$f(x) = \ln(-x)$$, $$a = -1$$.]

@p[$$f(x) = \frac{1}{x}$$, $$a = 1$$.]

@p[$$f(x) = \sqrt[3]{x + 1}$$, $$a = 0$$.]

@gap

In problems @next(4), compute the value of the series and justify your answer.

@p[$$\sum_{n = 0}^\infty \frac{2^n}{n!}$$.]

@p[$$\sum_{n = 0}^\infty \frac{(-1)^n}{n + 1}$$.]

@p[$$\sum_{n = 0}^\infty (n + 1)\left( \frac{1}{2} \right)^n$$.]

@p[$$\sum_{n = 0}^\infty \frac{(-4)^n}{(2n)!}$$.]

@gap

In problems @next(4), approximate the value to within $0.01$ using Taylor series. 

@p[$$\cos(2)$$.]

@p[$$\frac{1}{e^2}$$.]

@p[$$\ln\left( \frac{1}{2} \right)$$.]

@p[$$\sqrt[4]{\frac{1}{2}}$$.]

@gap

@p[Using the fact that $$\sum_{n = 1}^\infty \frac{1}{n^2} = \frac{\pi^2}{6}$$, evaluate $$\int_0^1 \frac{\ln(1 + x)}{x}$$.]

@p[Find a series solution to $$\frac{1}{x} + y'' = \frac{y}{x}$$.]

@gap

@p[The function $\sin(x)$ has zeroes at exactly $x = \pi n$ for integers $n$, and this allows us to write $\sin(x)$ as]

$$
	\sin(x) = x\left( 1 - \frac{x}{\pi} \right)\left( 1 + \frac{x}{\pi} \right)\left( 1 - \frac{x}{2\pi} \right)\left( 1 + \frac{x}{2\pi} \right) \cdots.
$$

Note that this isn't true for functions in general! There can often be a lot more going on with a function than we can determine by its zeros.

+ Divide by $x$ to find an expression for $$\frac{\sin(x)}{x}$$.

+ Use the difference of squares formula $(a - b)(a + b) = a^2 - b^2$ to group each two consecutive factors in the product.

+ Expand $$\frac{\sin(x)}{x}$$ as a Maclaurin series. What is the coefficient of $x^2$?

+ In the grouped product, what is the coefficient of $x^2$? You'll likely need to express it as a sum.

+ Set the two sides equal to one another. What have you shown?