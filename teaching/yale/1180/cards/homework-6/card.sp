@@@
	import { gap, problem as p, problemNumberNextRange as next, problemNumberPreviousRange as prev, problemNumberRange as range } from "../../../../../build/spruce.js";

	function document(body)
	{
		return body;
	}
@@@

# Homework 6

*Due Monday, October 27th at 11:59 PM*

Complete the following problems and submit them as a pdf to Gradescope. You should show enough work that there is no question about the mathematical process used to obtain your answers, and so that your peers in the class could easily follow along. I encourage you to collaborate with your classmates, so long as you write up your solutions independently. If you collaborate with any classmates, please include a statement on your assignment acknowledging with whom you collaborated.


@gap

In problems @next(6), find the boundary of the given set and state whether it is closed, bounded, and/or compact.

@p[$A = \left\{ (x, y) \in #R#^2 \mid x \leq y \right\}$.]

@p[$B = \left\{ (x, y, z) \in #R#^3 \mid x^2 + y^2 < 1 - z^2 \right\}$.]

@p[$C = \left\{ (x, y) \in #R#^2 \mid y = \sin(x) \text{ and } x \in [-\pi, \pi] \right\}$.]

@p[$D = \left\{ (x, y) \in #R#^2 \mid y = \sin\left( \frac{1}{x} \right) \text{ and } x \in [-\pi, \pi] \right\}$.]

@p[$E = \left\{ x \in #R# \mid x \text{ is an integer} \right\}$.]

@p[$F = \left\{ x \in #R# \mid x \text{ is a rational number} \right\}$.]

@gap

In problems @next(3), give an example of a set $A$ in $#R#^2$ with the following properties or briefly explain why it is impossible.

@p[$A$ is compact and contains infinitely many points.]

@p[$A$ is not compact and contains finitely many points.]

@p[(Bonus --- challenging) $A$ is not closed but is equal to the boundary of another set $B$.]

@gap

In problems @next(4), find the global minimum and maximum of the function on the given domain.

@p[$f(x, y) = x^2 + y^2 - 4x - 6y$ on $\left\{ (x, y) \in #R#^2 \mid 0 \leq x \leq 5 \text{ and } 0 \leq y \leq 7 \right\}$.]

@p[$g(x, y) = xy - x - y$ on $\left\{ (x, y) \in #R#^2 \mid 0 \leq x \leq 3 \text{ and } 0 \leq y \leq x \right\}$.]

@p[$h(x, y) = x^2 - xy + y^2$ on $\left\{ (x, y) \in #R#^2 \mid x^2 + y^2 = 2 \right\}$.]

@gap

@p[Apply Lagrange multipliers to $f(x, y) = e^{xy}$ on $\left\{ (x, y) \in #R#^2 \mid x^3 + y^3 = 16 \right\}$. Why do we only find a single critical point?]

@gap

@p[Find the points on the ellipse $4x^2 + y^2 = 4$ closest to and farthest from $(1, 0)$. (Hint: optimize the square of the distance rather than the distance itself in order to avoid square roots.)]