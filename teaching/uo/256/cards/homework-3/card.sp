@@@
	import { gap, problem as p, problemNumberNextRange as next, problemNumberPreviousRange as prev, problemNumberRange as range } from "../../../../../build/spruce.js";

	function document(body)
	{
		return body;
	}
@@@

# Homework 3

*Due Wednesday of Week 4 at the start of class*

Complete the following problems and submit them as a pdf to Canvas. 8 points are awarded for thoroughly attempting every problem, and I'll select three problems to grade on correctness for 4 points each. Enough work should be shown that there is no question about the mathematical process used to obtain your answers.



## Section 3

In problems @next(3), find the indicated derivative.

@p[$$p/pt \left[ 2ty + \sin(t) \right].$$]

@p[$$p/py \left[ \sin(xy^x) \right].$$]

@p[$$p/px \left[ \sin(xy^x) \right].$$]

@gap

@p[Using the multivariable Chain Rule, find $$\frac{d f(x, y)}{dt}$$, where $$f(x, y) = 2x^2 + \sec(xy^2)$$, $x(t) = t$, and $y(t) = 5t^2$.]

@gap

In problems @next(3), find the indicated integral. Make sure to express the constant as a function of the correct variable.

@p[$$\int f(x, y)\,\d x$$ for $$f(x, y) = 2x\cos(y - x).$$]

@p[$$\int f(x, y)\,\d y$$ for $f$ as in the previous problem.]

@p[$$\int g(x, y)\,\d y$$ for $$g(x, y) = e^{x^2}.$$]

@gap

In problems @next(7), solve the the given DE.

@p[$$2y + 1 + (2x + 1)y' = 0,$$ $$y(1) = 1.$$]

@p[$$1 - \sin(t + y) + y'(-\sin(t + y)) = 0,$$ $$y(0) = 0.$$]

@p[$$\sin(y)y' - te^t\cos(y) = 0.$$]

@p[$$y' = -\frac{yx^{y - 1}}{x^y\log(x)},$$ $$y(2) = 1.$$]

@p[$$ty' + y + t^{-2} = 0,$$ $$y(2) = 2.$$]

@p[$$(10t + t^2) - 2\sin(y)y' = 0,$$ $$y(0) = 1.$$]

@p[]

$$
	\sec^2(x)\sec(y) + \left( \tan(x) \tan(y) \sec(y) + \frac{1}{y} \right)y' = 0.
$$