@@@
	import { gap, problem as p, problemNumberNextRange as next, problemNumberPreviousRange as prev, problemNumberRange as range } from "../../../../../build/spruce.js";

	function document(body)
	{
		return body;
	}
@@@

# Homework 4

*Due Wednesday of Week 5 at the start of class*

Complete the following problems and submit them as a pdf to Canvas. 8 points are awarded for thoroughly attempting every problem, and I'll select three problems to grade on correctness for 4 points each. Enough work should be shown that there is no question about the mathematical process used to obtain your answers.



## Section 4

In problems @next(5), solve the DE and verify that you've found the general solution with the Wronskian.

@p[$$y'' + 2y' - 3y = 0.$$]

@p[$$y'' + 3y' = 0.$$]

@p[$$4y'' - 9y = 0.$$]

@p[$$y'' - y' - y = 0.$$]

@p[$$y'' = y'.$$]

@gap

In problems @next(3), solve the initial value problem.

@p[$$y'' + y' - 20y = 0,$$ $$y(0) = 9,$$ $$y'(0) = 18.$$]

@p[$$2y'' + 6y' = 20y,$$ $$y(0) = 14,$$ $$y'(0) = 0.$$]

@p[$$y'' - y = 0,$$ $$y(0) = 4,$$ $$y'(0) = 2.$$]

@gap

@p[Consider the DE $$2t^2y'' - ty' + y = 0.$$]

+ how that a solution is $$y = c_1t + c_2\sqrt{t}.$$

+ Compute $$W\left[t, \sqrt{t}\right].$$ For which value $t = t_0$ is it zero?

+ Why is $t = t_0$ a problem?

@gap

@p[Let $y = a(t) + b(t)i$ be a solution to]

$$
	y'' + p(t)y' + q(t)y = 0,
$$

where $a$, $b$, $p$, and $q$ are all real-valued functions. Show that both $a$ and $b$ must be solutions to $y'' + p(t)y' + q(t)y = 0$ themselves.

@gap

@p[Consider the DE $$y'' - yy' = 0.$$]

+ Show that both $$y = \tan\left(\frac{x}{2}\right)$$ and $$y = 2\tan\left(x + 1\right)$$ are solutions.

+ Show that

$$
	y = c_1\tan\left(\frac{x}{2}\right) + 2c_2\tan\left(x + 1\right)
$$

is *not* a solution in general. Why does this not contradict the results of section 4?