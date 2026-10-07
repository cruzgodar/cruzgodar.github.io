### nav-buttons



When we optimize a function $f(x, y)$ --- for example, if $f(x, y) = 2x + xy + 5y$ gives the monthly profit to a birding store selling $x$ pairs of binoculars and $y$ birdhouses per month --- there is very often a constraint relating the inputs $x$ and $y$. Here, we might expect one of the form $ax + by \leq c$, where $a$ is cost to the store per binocular they stock, $b$ is the cost per birdhouse, and $c$ is the total amount the store has available to spend per month.

With a constraint like that, the problem makes much more sense: maximize $f(x, y)$ *given* $ax + by \leq c$. For this problem, let's say that our constraint is $10x + 5y \leq 100$, and implicitly also that $x \geq 0$ and $y \geq 0$. The techniques of the previous section might let us find where the critical points of the function are, but they don't have much to say about the boundary of the region. This is a direct analogue of the story of single-variable optimization: when we optimize a function of one variable $f(x)$ that's defined on a closed interval $[a, b]$, we have to consider not just its critical points, but also the endpoints $a$ and $b$ of the interval: the function might have local maxima or minima there. In fact, it very often does!

### desmos endpoints

Functions like this one are great examples of the **Extreme Value Theorem** for functions of a single variable, which says that a continuous function $f(x)$ on a closed interval always has a global maximum and a global minimum. In the previous graph, defining $f$ on all of $#R#$ or ditching the endpoints by defining it on $(a, b)$ results in a function with no global max or min. There are largely two relevant properties of $[a, b]$ that are not shared by $(a, b)$, $[a, \infty)$, or $(-\infty, \infty)$: first, $[a, b]$ contains the endpoints $a$ and $b$, which is necessary so that $x$ can't approach $a$ or $b$ without reaching it and thereby keep $f$ from having a global extremum. Second, $[a, b]$ doesn't extend infinitely far in either direction, meaning $f$ can't increase or decrease forever and avoid having a global extremum that way.

If we'd like to bring the Extreme Value Theorem and this surrounding discussion to functions $f(x, y)$, then we need to extend the concept of a closed interval to $#R#^2$ by pinning down both of these properties.



## Compact Sets

### def -m "Informal definition: bounded set"

	Let $B$ be a set of points in $#R#^n$. We say that $B$ is **bounded** if it does not extend infinitely far from the origin.

###

The other property is a bit more subtle, but for our purposes, we're going to engage with it on a more utilitarian level.

### def -m "Informal definition: closed set"

	A set of points $A$ in $#R#^n$ is **closed** if there is no way to take a path through the set that approaches a point *not* in the set.

###

For example, the open unit disk

$$
	\left\{ (x, y) \in #R#^2 \mid x^2 + y^2 < 1 \right\}
$$

is not closed, since we can walk through the set and approach a point on the unit circle, but that point is not in the set. In contrast, the closed unit disk

$$
	\left\{ (x, y) \in #R#^2 \mid x^2 + y^2 \leq 1 \right\}
$$

is closed (which we'd hope, given the name!), since all the points we can approach are in the set.

To be clear, both of these are informal and imprecise definitions. They'll do well for our purposes, but neither is a proper mathematical definition. If you'd like to see a more thorough treatment of this material, please take a look at the <a href="/teaching/notes/calculus/boundary-optimization">same section of notes in my calculus series!</a>

The Extreme Value Theorem in single-variable calculus told us about functions defined on closed and bounded intervals, and those same two conditions will be relevant to functions of multiple variables; let's give it a name.

### def "compact set"

	A set $K$ in $#R#^n$ is **compact** if it is closed and bounded.

###

### exc "compact sets"

	Consider the following four sets in $#R#^2$.

	$$
		A &= \left\{ (x, y) \in #R#^2 \mid 1 \leq x \leq 3 \text{ and } 2 < y < 4 \right\}

		B &= \left\{ (x, y) \in #R#^2 \mid x^2 + y^2 > 1 \right\}

		C &= \left\{ (t, t^2) \in #R#^2 \mid 0 \leq t \leq 1 \right\}

		D &= #R#^2.
	$$

	Determine whether $A$, $B$, $C$, and $D$ are closed and whether they are bounded. Are any of them compact?

###



## Optimizing on Simple Boundaries

With compact sets defined and explored, let's return to the matter at hand and apply them.

### thm "The Extreme Value Theorem"

	Let $f : #R#^n \to #R#$ be a continuous function of $n$ variables defined on a compact set $K$ (i.e. $f: K \to #R#$). Then $f$ must attain a global maximum and minimum on $K$.

###

We apply the EVT the same way that we did in single-variable calculus: first, we optimize a function by finding all of its critical points. Then, if it's defined on a compact set, we also evaluate it at every point in the boundary and compare those values to one another and to the critical points' values. The smallest is the global min, and the largest is the global max.

### ex "optimizing a function"

	Let $f(x, y) = x^3 - y^2 + 2xy$ be defined on the rectangle

	$$
		\left\{ (x, y) \in #R#^2 \mid -1 \leq x \leq 0 \text{ and } -2 \leq y \leq 0 \right\}.
	$$

	Find the global extrema of $f$.

	### solution

	We saw this function in the previous section; its critical points were $(0, 0)$, which was a saddle point, and $\left( -\frac{2}{3}, -\frac{2}{3} \right)$, which was a local max whose value was $f\left( -\frac{2}{3}, -\frac{2}{3} \right) = \frac{4}{27}$. Since the set on which $f$ is defined is compact (it's a closed rectangle), we can evaluate $f$ at all the points along the boundary and determine the smallest and largest value. Compared to plugging in the two endpoints of an interval in single-variable calculus, though, this is quite a bit more work. The boundary of this rectangle consists of the lines $x = -1$ and $x = 0$, both defined for $y \in [-2, 0]$, and similarly, $y = -2$ and $y = 0$ for $x \in [-1, 0]$. Knowing that, we can approach each line separately.

	$x = -1$: starting here, we can literally set $x = -1$ in the equation to find $f(-1, y) = -1 - y^2 - 2y$. We're interested in optimizing this function on the interval $[-2, 0]$, and so we can return to the techniques of single-variable calculus. Taking the derivative and setting it equal to zero,

	$$
		-2y - 2 &= 0

		y &= -1.
	$$

	The possible points are then $(-1, -2)$, $(-1, -1)$, and $(-1, 0)$. The first and last points there come from the EVT for single-variable functions: we have to include the endpoints of the interval $[0, -2]$ as candidates for global extrema.

	$x = 0$: this works identically, but with a different $x$-value. We have $f(0, y) = -y^2$, whose only critical point is $y = 0$, so we also consider the points $(0, -2)$, and $(0, 0)$.

	$y = -2$: we have $f(x, -2) = x^3 - 4 - 4x$, so taking the derivative,

	$$
		3x^2 - 4 &= 0

		x &= \pm \sqrt{\frac{4}{3}}.
	$$

	We only care about $x \in [-1, 0]$, though, and neither of these $x$-values is in that interval. We add the boundary points $(-1, -2)$ and $(0, -2)$ and move on.

	$y = 0$: finally, $f(x, 0) = x^3$, whose only critical point is at $x = 0$. Adding it and the other boundary point, we have $(-1, 0)$ and $(0, 0)$.

	Let's summarize! All of this work tells us that the global extrema of $f$ on this interval can *only* live at the critical points inside of its domain (i.e. $(0, 0)$ or $\left( -\frac{2}{3}, -\frac{2}{3} \right)$), or at one of the many points we found afterward on the boundary. To actually find the global min and max, all that's left is to compute their $z$-values one at a time.

	$$
		f(0, 0) &= 0

		f\left( -\frac{2}{3}, -\frac{2}{3} \right) &= \frac{4}{27}

		f(-1, -2) &= -1

		f(-1, -1) &= 0

		f(-1, 0) &= -1

		f(0, -2) &= -4.
	$$

	And that's it! The global max occurs at $\left( -\frac{2}{3}, -\frac{2}{3} \right)$ with a $z$-value of $\frac{4}{27}$, and the global min at $(0, -2)$ with a $z$-value of $-4$.

	### desmos evt

###

### exc "optimizing a function"

	Find the global maximum and minimum of the function $f(x, y) = xy - x - y$ on the region

	$$
		\left\{ (x, y) \in #R#^2 \mid 0 \leq x \leq 2 \text{ and } 0 \leq y \leq 2x \right\}.
	$$

###



## Lagrange Multipliers

We opened the section by thinking about a function $f(x, y) = 2x + xy + 5y$ giving the monthly profit to a birding store selling $x$ pairs of binoculars and $y$ birdhouses per month, subject to the constraint $10x + 5y \leq 100$. To get at a different method of optimization that doesn't require boundary parameterization, let's think about level curves. The maximum $(a, b)$ that we're looking for will occur at a point on some level curve of $f$, and also on the line $10x + 5y = 100$; let's draw both.

### desmos levelCurves

Immediately, we can see that we need to pick a small enough value of $c$ that the level curve $2x + xy + 5y = c$ actually intersects $10x + 5y = 100$; otherwise, there won't be any point in the intersection. But on the other hand, we *want $c$ to be as large as possible*, because crucially, $c$ is the output of $f(x, y)$ --- it's the thing we're trying to maximize. We therefore are looking for a value of $c$ where the level curve just barely touches the line $10x + 5y = 100$, or in other words, where the two are tangent.

Finding that $c$-value might be easy if the boundary is a line, but what if it's a more complicated curve? We owe it to ourselves to find a more general solution to finding a $c$-value whose level curve is tangent to the boundary.

Let's begin by giving the function defining the constraint a name: $g(x, y)$. And to handle more general boundary conditions, let's just insist that the boundary is given by $g(x, y) = 0$, so in this example, $g(x, y) = 10x + 5y - 100$. The magic comes from writing $g$ as a function of multiple variables, so that we can think of $g(x, y) = 0$ as being a level curve of $g$. Then these two curves being tangent is equivalent to saying that we can move in the same direction and not increase in height on either the graph of $f(x, y)$ or $g(x, y)$ --- in other words, that there's a single direction orthogonal to both $\G f$ and $\G g$. That happens when $\G f$ and $\G g$ point in the same direction or in opposite directions, and we can account for both cases by simply saying that $\G f$ is a constant multiple (possibly negative) of $\G g$. In the typical notation of this method, we'll denote that constant multiple by the Greek letter $\lambda$ (pronounced "lambda"), and call is a **Lagrange multiplier** when we occasionally have need for a name.

Let's see how this applies to our example. Given the profit function $f(x, y)$ that we're trying to maximize and the constraint $g(x, y)$, we set up two equations:

$$
	\G f(x, y) &= \lambda \G g(x, y)

	g(x, y) &= 0
$$

While this might seem like two equations and three unknowns, it's not! Let's expand it out and see why.

$$
	\left< 2 + y, x + 5 \right> &= \lambda \left< 10, 5 \right>

	10x + 5y - 100 &= 0.
$$

The two equations are actually three, since in the first one, both the first and second components of the vector must be equal. Therefore,

$$
	2 + y &= 10\lambda

	x + 5 &= 5\lambda

	10x + 5y - 100 &= 0.
$$

It's generally a good strategy to eliminate $\lambda$ from these equations; here, we have

$$
	\lambda &= \frac{2 + y}{10}

	\lambda &= \frac{x + 5}{5}

	\frac{2 + y}{10} &= \frac{x + 5}{5}

	(2 + y)(5) &= (x + 5)(10)

	10 + 5y &= 10x + 50

	2 + y &= 2x + 10

	y &= 2x + 8.
$$

Plugging this back into the constraint equation,

$$
	10x + 5(2x + 8) - 100 &= 0

	20x &= 60

	x &= 3

	y &= 2(3) + 8

	&= 14.
$$

We only found one critical point! Normally, we'd expect at least two, since there should be an absolute minimum and maximum on any compact domain. However, the set on which we're optimizing this function is a line, which isn't compact since it's not bounded! The Extreme Value Theorem therefore doesn't apply. Determining whether this one point is a maximum, minimum, or saddle point can be a little delicate --- checking nearby points on the line $g(x, y) = 0$ tells us that their $z$-values are less than $118$, though, so this is in fact a maximum. Although it's an oversimplified example, this method genuinely gave us an output to inform how we should allocate our spending on products to maximize profit!

Lagrange multipliers are borderline magic. They let us optimize functions on a boundary without ever needing to parameterize a thing, and they don't just work for finding maxima --- the same logic tells us that we can minimize $f$ on the boundary in this way too. Let's state the method carefully.

### thm -m "Method: Lagrange multipliers"

	Let $f(x, y)$ be a function of two variables, and let $g(x, y)$ be any function. To optimize $f$ on the curve $g(x, y) = 0$,

	1. Solve the system of equations

	$$
		\G f(x, y) &= \lambda \G g(x, y)

		g(x, y) &= 0
	$$

	to find potential critical points $(x, y)$. Also consider the points where $\G g(x, y)$ is undefined.

	2. Of all the points $(x, y)$ in step 1, the largest and smallest values of $f(x, y)$ among those solutions are the values we're looking for. If there is only a single solution $(a, b)$, then it's either a maximum or minimum. To determine which, just plug in another point $(c, d)$ with $g(c, d) = 0$ to see if $f(c, d)$ is larger or smaller than $f(a, b)$.

###

### exc "Lagrange multipliers"

	Let $f(x, y) = xy$ be defined on the astroid $\left\{ (x, y) \in #R#^2 \mid x^{2/3} + y^{2/3} = 1 \right\}$. Find the absolute maximum and minimum of $f$.

	### solution

	We have $f(x, y) = xy$ and $g(x, y) = x^{2/3} + y^{2/3} - 1$, and so our system of equations is

	$$
		\G f(x, y) &= \lambda \G g(x, y)

		g(x, y) &= 0

		~

		\left< y, x \right> &= \lambda\left< \frac{2}{3}x^{-1/3}, \frac{2}{3}y^{-1/3} \right>

		x^{2/3} + y^{2/3} - 1 &= 0

		~

		y &= \frac{2}{3}\lambda x^{-1/3}

		x &= \frac{2}{3}\lambda y^{-1/3}

		x^{2/3} + y^{2/3} - 1 &= 0.
	$$

	Eliminating $\lambda$,

	$$
		\frac{3}{2} y x^{1/3} &= \lambda

		\frac{3}{2} x y^{1/3} &= \lambda

		\frac{3}{2} y x^{1/3} &= \frac{3}{2} x y^{1/3}

		x^{2/3} &= y^{2/3}
	$$

	While can can very well solve this completely for $x$ or $y$, we can also just plug it back into the constraint equation $g(x, y) = 0$:

	$$
		x^{2/3} + y^{2/3} - 1 &= 0

		x^{2/3} + x^{2/3} - 1 &= 0

		2x^{2/3} &= 1

		x^{2/3} &= \frac{1}{2}

		x^2 &= \frac{1}{8}

		x &= \pm \sqrt{\frac{1}{8}}

		&= \pm \left( \frac{\sqrt{2}}{2} \right)^3,
	$$

	as before. Solving for $y$, we can cube both sides of $x^{2/3} = y^{2/3}$ to get $x^2 = y^2$, so $y = \pm \left( \frac{\sqrt{2}}{2} \right)^3$ for both $x$-values. Notably, we missed the points $(\pm 1, 0)$ and $(0, \pm 1)$ --- those are the points where $\G g(x, y)$ is undefined, so we also need to consider them. Once we've added those in, though, we've successfully recovered the same points that we saw in the example earlier in this section! From here, the same logic applies --- we plug them all in and find the largest and smallest.

###

### ex "Lagrange multipliers"

	You've been tasked with building a rectangular beaver transport box. Since beavers can't jump, the box will have no lid. However, the front and back of the box must be protected from chewing and tail impacts, so they'll be made out of metal, costing $\$2$ per square foot, while the other two sides and base will be made out of wood, costing $\$1$ per square foot. You have a budget of $\$24$ --- how large of a box can you build?

	### solution

	With $f(x, y, z) = xyz$ and

	$$
		g(x, y, z) = xy + 4yz + 2xz - 24 = 0
	$$

	(assuming the area measured by $yz$ is what costs $\$2$ per square foot), we have

	$$
		\G f &= \lambda G g

		\left< yz, xz, xy \right> &= \lambda \left< y + 2z, x + 4z, 4y + 2x \right>

		~

		yz &= \lambda(y + 2z)

		xz &= \lambda(x + 4z)

		xy &= \lambda(4y + 2x).
	$$

	We can eliminate $\lambda$ from the first two equations:

	$$
		\frac{yz}{y + 2z} &= \frac{xz}{x + 4z}

		yz(x + 4z) &= xz(y + 2z)

		xyz + 4yz^2 &= xyz + 2xz^2

		2y &= x.
	$$

	Now eliminating $\lambda$ from the first and third equations,

	$$
		\frac{yz}{y + 2z} &= \frac{xy}{4y + 2x}

		yz(4y + 2x) &= xy(y + 2z)

		4y^2z + 2xyz &= xy^2 + 2xyz

		4y^2z &= xy^2

		4y^2z &= (2y)y^2

		2y^2z &= y^3

		y^3 - 2y^2z &= 0

		y^2(y - 2z) &= 0,
	$$

	so either $y = 0$, which isn't so good for box-building, or $y = 2z$, meaning $x = 4z$. Now in the constraint equation,

	$$
		xy + 4yz + 2xz &= 24

		(4z)(2z) + 4(2z)z + 2(4z)z &= 24

		8z^2 + 8z^2 + 8z^2 &= 24

		z^2 &= 1

		z &= \pm 1.
	$$

	We want the positive version --- the negative one is the minimum on the boundary, and the positive one is the maximum! The box's dimensions are $4\,\text{ft} \times 2\,\text{ft} \times 1\,\text{ft}$.

###



### nav-buttons