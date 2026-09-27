@@@
	import { gap, problem as p, problemNumberNextRange as next, problemNumberPreviousRange as prev, problemNumberRange as range } from "../../../../../build/spruce.js";

	function document(body)
	{
		return body;
	}
@@@

# Homework 5

*Due Wednesday of Week 6 at the start of class*

Complete the following problems and submit them as a pdf to Canvas. 8 points are awarded for thoroughly attempting every problem, and I'll select three problems to grade on correctness for 4 points each. Enough work should be shown that there is no question about the mathematical process used to obtain your answers.


## Section 5

In problems @next(6), solve the DE. If possible, verify that you've found the general solution with the Wronskian.

@p[$$y'' + 6y' + 9y = 0.$$]

@p[$$ty'' + y' = 0.$$]

@p[$$y'' + 10y' + 26y = 0.$$]

@p[$$y'' - 2y' - 8y = 0.$$]

@p[$$y'' - 100y = 0.$$]

@p[$$y'' + 100y = 0.$$]

@gap

In problems @next(2), solve the initial value problem and determine the behavior of the solution as $t \to \infty$.

@p[$$y'' - 2y' + 17y = 0,$$ $$y(0) = 4,$$ $$y'(0) = -4.$$]

@p[$$y'' + 8y' + 16y = 0,$$ $$y(0) = 1,$$ $$y'(0) = 0.$$]

@gap

@p[One fundamental solution to $$ty'' - y' + t^3y = 0$$ is $y = \sin\left(\frac{t^2}{2}\right)$. Find the other.]

@p[One fundamental solution to $$t^2y'' + ty' + y = 0$$ is $y = \sin(\log(t))$. Find the other.]



## Section 6

In problems @next(8), find the general solution to the DE.

@p[$$y'' - 2y' - 3y = 8e^t.$$]

@p[$$y'' - 2y' - 3y = 8e^{3t}.$$]

@p[$$y'' + y = 3\sin(t) + e^t.$$]

@p[$$y'' + 6y' + 9y = 120t^2e^{-3t}.$$]

@p[$$4y'' + y = \sec\left(\frac{t}{2}\right).$$]

@p[$$y'' + 2y' + y = 2t\sin(t).$$]

@p[$$y'' + 4y' + 4y = t^{-2} e^{-2t}.$$]

@p[$$y'' + 3y' + 2y = \frac{1}{1 + e^t}.$$]