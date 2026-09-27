@@@
	import { gap, problem as p, problemNumberNextRange as next, problemNumberPreviousRange as prev, problemNumberRange as range } from "../../../../../build/spruce.js";

	function document(body)
	{
		return body;
	}
@@@

# Homework 2

*Due Wednesday of Week 3 at the start of class*

Complete the following problems and submit them as a pdf to Canvas. 8 points are awarded for thoroughly attempting every problem, and I'll select three problems to grade on correctness for 4 points each. Enough work should be shown that there is no question about the mathematical process used to obtain your answers.



## Section 2

In problems @next(10), solve the DE. Whenever possible, fully evaluate all integrals.

@p[$$y' + 2y = e^{-2t},$$ $$y(0) = -1.$$]

@p[$$y' + \frac{y}{t} = \sin(t),$$ $$y(\pi) = 0.$$]

@p[$$xy' = \sqrt{y^2x^2 - y^2}.$$ Hint: during the integration, you'll want to set $x = \sec(\theta)$ and use trig sub.]

@p[$$y' = y + t^2e^t.$$]

@p[$$y' = \frac{t}{1 + y},$$ $$y(0) = -2.$$]

@p[$$y' + ty^2 + ty + 2y^2 + 2y = 0.$$]

@p[$$ty' + (t + 1)y = t + 2,$$ $$y(1) = 2.$$]

@p[$$\cos^2(t)y' = 1 + y.$$]

@p[$$y' = t + \frac{t}{y}.$$]

@p[$$y' = e^{x + y},$$ $$y(0) = 0.$$]

@gap

@p[You invest $\$1000$ into an account which compounds interest **continuously** --- in other words, your balance is constantly increasing at a rate proportional to its current value. If the continuous interest rate is $0.2\%$ per year, how much money will be in the account after 10 years?]

@gap

@p[The population $P(t)$ of a colony of bacteria after $t$ hours (in thousands) follows the equation $$P' + P = 2^{-t} + 1.$$ After enough time, what will the population settle down to?]

@gap

@p[The function $y$ satisfies $y' = y\log(x)$ with $$y(1) = \frac{1}{e}.$$]

+ Express $y''$ in terms of $x, y$, and $y'$.

+ Solve the original DE, find $y''$ in terms of $x$ only, and verify that your answer to part a) was correct.

@gap

@p[Solve the DE $$y' + xy = x$$ in two ways: first with integrating factors and then with separation of variables. Make sure your answers are the same!]

@gap

@p[True or false: if a DE is separable, then its direction field is symmetric about the origin  --- i.e. the slope at $(x, y)$ is the same as the slope at $(-x, -y)$. If it's true, briefly explain why, and if it's false, give a counterexample.]

@gap

@p[A tank is filled with $1\,\text{L}$ of water. We begin pouring in a salt solution with a concentration of $2\,\frac{\text{g}}{\text{mL}}$ at a rate of $10\,\frac{\text{mL}}{\text{s}}$, and also begin draining the tank at a rate of $10\,\frac{\text{mL}}{\text{s}}$. What will the concentration of salt be after an hour?]

@p[A tank is filled with $100\,\text{L}$ of uncolored paint. We begin pouring in a solution of red paint, which contains $0.5\,\frac{\text{kg}}{\text{L}}$ of dye, at a rate of $1\,\frac{\text{L}}{\text{s}}$. We also begin draining the well-mixed paint from the bottom of the tank at a rate of $1\,\frac{\text{L}}{\text{s}}$. How long will it take for the paint in the tank to have half the concentration of dye that the incoming red paint does?]