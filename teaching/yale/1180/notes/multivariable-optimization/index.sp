### nav-buttons



At long last, it's time to talk about optimization. This was our main application of derivatives in Calculus I, and we can boil it down to a few sentences: to find the maxima and minima of a function $f(x)$ defined on all of $#R#$, we take its derivative $f'(x)$ and find every point $x = c$ where $f'(c) = 0$ or $f'(c)$ is undefined, called the **critical points**. They're the places where there *might* be an extremum, and to classify them, we can use one of two methods.

> - The **first derivative test** has us evaluate $f'(x)$ at nearby points to the left and right of $x = c$, close enough to be between $c$ and any adjacent critical points. If $f'(x)$ is negative to the left of $c$ and positive to the right, then there is a local minimum at $x = c$, and if the opposite is true, there is a local maximum. If the derivative has the same sign to both the left and right and $f'(c) = 0$, then this isn't an extremum at all --- it's a saddle point, like with $y = x^3$ at $x = 0$.

> - The **second derivative test** works only for critical points $c$ where $f'(c) = 0$. We evaluate $f''(x)$ *at* $x = c$, which measures the concavity of $f$. If $f''(c) > 0$, that means the function is concave up at $x = c$, and so $x = c$ is a local minimum, and similarly, if $f''(c) < 0$, then $x = c$ is a local maximum. If $f''(c) = 0$, then the test is inconclusive --- it might be a saddle point, like $f(x) = x^3$ at $x = 0$, or it might be an extremum, like $f(x) = x^4$ at $x = 0$.

With this brief refresher out of the way, let's dig into how this all extends to functions of multiple variables! While our discussion of critical points will work for functions of any number of variables, our later work will focus specifically on functions of two variables --- the theory extends out beyond that, but unfortunately also beyond our class's scope at the same time.



## Critical Points

We'll begin with critical points, which generalize nicely to more variables. While it might be tempting to say that a critical point is one where at least one partial derivative is zero, rather than all of them, that doesn't quite work: for example, $f(x, y) = x^2 + y$ has $f_x(x, y) = 0$ whenever $x = 0$, but $f_y = 1$, so none of those points is a critical point.

### desmos notCriticalPoints

Instead, we'll define critical points as those where *all* partials are zero --- points with a flat tangent plane, assuming $f$ is differentiable.

### def "critical point"

	Let $f : #R#^n \to #R#$ be a function of $n$ variables. A **critical point** of $f$ is a point $p$ in the domain of $f$ with $\G f(p) = \vec{0}$ or where $\G f(p)$ is undefined.

###

This is a notationally dense but efficient way to say that critical points are where all of the partial derivatives (and therefore all directional derivatives, assuming $f$ is differentiable) are zero at once. We do this so that the tangent plane (for a function of two variables) is flat at $(x, y) = p$, which is the generalization of critical point that we need.

### desmos criticalPoints

This function has five critical points; two are local maxima, two are local minima, and one (at $(0, 0)$) is neither.

### exc "critical points"

	Find the critical points of the following functions.

	1. $f(x, y) = x^3 + y^2 - 2x^2 + xy$.

	2. $g(x, y) = \sqrt{x^2 + y^2}$.

	3. $h(x, y, z) = xyz$.

	### solution

	1. Let's start by finding the gradient. We have

	$$
		\G f = \left< 3x^2 - 4x + y, 2y + x \right>,
	$$

	which is zero when both

	$$
		3x^2 - 4x + y &= 0

		2y + x &= 0.
	$$

	We can solve for $y$ in the first equation and plug it into the second to get

	$$
		-6x^2 + 8x + x &= 0

		x(9 - 6x) &= 0

		x &= 0, \quad x = \frac{3}{2}.
	$$

	Plugging those back in,

	$$
		y &= 0, \quad y = -\frac{3}{4},
	$$

	and so our two critical points are $(0, 0)$ and $\left( \frac{3}{2}, -\frac{3}{4} \right)$.

	2. This time, the gradient is

	$$
		\G g = \left< \frac{1}{2} \left( x^2 + y^2 \right)^{-1/2}(2x), \frac{1}{2} \left( x^2 + y^2 \right)^{-1/2}(2y) \right>,
	$$

	which could only possibly be zero when $(x, y) = (0, 0)$, but it's undefined there anyway. That's our single critical point!

	3. This time, the gradient is a 3-dimensional vector:

	$$
		\G h = \left< yz, xz, xy \right>.
	$$

	This is a little more complicated to think through: we need all of those to be zero, but each component only requires one of its factors to be zero. Therefore, we can get away with having $x = y = 0$ but not $z$, or any other combination of two variables. The critical points are exactly the three coordinate axes!

###



With critical points extended to $#R#^n$, the next missing piece is extrema. These work identically to functions of a single variable! For clarity, we'll state the definition in terms of a function of two variables, but it works just as well for any function $f : #R#^n \to #R#$.

### def "extrema"

	Let $f(x, y)$ be a function of two variables that is defined on an open disk containing $(a, b)$ (i.e. nearby the point $(a, b)$). We say $f$ has a **local maximum** at $(a, b)$ if $f(x, y) \leq f(a, b)$ for all $(x, y)$ near $(a, b)$. Similarly, $f$ has a **local minimum** at $(a, b)$ if $f(x, y) \geq f(a, b)$ for all $(x, y)$ near $(a, b)$. We collectively call these **local extrema**.

	We say that $f$ has a **global** or **absolute maximum** at $(a, b)$ if $f(x, y) \leq f(a, b)$ for all $(x, y)$ in the domain of $f$, and similarly, $f$ has a **global** or **absolute minimum** at $(a, b)$ if $f(x, y) \geq f(a, b)$ for all $(x, y)$ in the domain of $f$. We collectively call these **global** or **absolute extrema**.

###

Perhaps unsurprisingly, critical points are potential locations for extrema, just like in single-variable calculus!

### thm "Fermat's Theorem"

	Let $f : #R#^n \to #R#$ be a function of $n$ variables, and suppose $f$ has a local extremum at an interior point $p$ of its domain (i.e. not on the boundary). Then $p$ is a critical point.

###

The converse of this theorem (i.e. reversing the hypothesis and conclusion) isn't true! Just like with functions of a single variable, not all critical points are extrema: for example, $f(x, y) = x^2 - y^2$ has a critical point at $(0, 0)$ that is neither a local maximum nor a minimum.

### desmos saddlePoint

Critical points like this one are interesting to focus in on. Since the point isn't a local max or min, we know there must be some nearby points above it and other below it, just like with $y = x^3$. We use the same term --- **saddle point** --- to describe critical points like this, and the name is even more apt with how much graphs like these resemble saddles.

If we know that $(a, b)$ is a critical point of $f$, how do we determine if it's a local maximum or minimum? Of the two derivative tests we mentioned for functions of a single variable, the first derivative test is unfortunately prohibitively difficult to apply for functions of multiple variables. It relied on there being only two directions to move from a point at $x = a$: either to the right or left. For a two-variable function, there's now an entire circle of directions we could move from a critical point $(a, b)$. That means in order to verify that $f$ has a local maximum at $(a, b)$, we'd need to show that the gradient $\G f$ points in a direction more toward $(a, b)$ than away from it for every point in a circle close to $(a, b)$. It's certainly *possible*, but from that description, it's pretty clear the juice just isn't worth the squeeze. So with that test out, let's turn to the remaining one.



## The Second Derivative Test

Immediately upon considering how the second derivative test might generalize to a function $f(x, y)$, we're met with other problems: we have *four* second-order partial derivatives of $f$ and no complete second-derivative replacement like we did with the gradient. As it turns out, though, we can solve both problems at once. As a disclaimer, this portion of the section is *exclusively* for functions of two variables, as will probably be clear before long. Like we mentioned, everything we discuss is generalizable to more variables, but we have neither the tools nor time in this class. I'm more than happy to discuss the broad strokes outside of class, though!

Let's now focus in on a function $f(x, y)$ with a critical point at $(a, b)$ and see what we can do. Most discussions of this topic are either completely lacking motivation or extremely technical, but I hope to provide a more intuitive and mathematically whole explanation. The credit for the broad strokes goes to <a href="https://youtube.com/watch?v=Q5Q9oswM2wo">Linda Green</a> --- I'm merely presenting that story here in a more bottom-up manner.

The saddle point of $f(x, y) = x^2 - y^2$ was effectively due to the graph having different concavity in the $x$- and $y$-directions. We might hope we could just check the signs of both $f_{xx}(a, b)$ *and* $f_{yy}(a, b)$ to produce an analogue to the second derivative test, but the reality is more complicated: for example, $f(x, y) = x^2 + y^2 - 3xy$ has $f_{xx}(0, 0) = f_{yy}(0, 0) = 2$, making $(0, 0)$ look like a local min, but the concave down part of the graph is just in a different direction.

### desmos secretSaddle

This counterexample gives us a hint, though: we could verify that $(0, 0)$ was a local minimum not if the concavity in just the $x$- and $y$-directions were positive, but if the concavity in *all* directions were positive. Specifically, let's take what we might call a *second directional derivative* and see what we can determine.

Let $\vec{u} = \left< c, d \right>$ be a unit vector and consider $D_{\vec{u}}D_{\vec{u}} f$. The gradient formula for the directional derivative tells us that

$$
	D_{\vec{u}}D_{\vec{u}} f &= D_{\vec{u}} \left( \G f \bullet \left< c, d \right> \right)

	&= D_{\vec{u}} \left( cf_x + df_y \right)

	&= \G \left( cf_x + df_y \right) \bullet \left< c, d \right>

	&= \left< cf_{xx} + df_{yx}, cf_{xy} + df_{yy} \right> \bullet \left< c, d \right>

	&= c^2f_{xx} + cdf_{yx} + cdf_{xy} + d^2f_{yy}.
$$

While the gradient $\G \left( cf_x + df_y \right)$ might be daunting, $cf_x + df_y$ is just a function itself, and so we can take $p/px$ and $p/py$ of it without issue, as we did above --- they both split across addition and factor through the scalar multiplication by $c$ and $d$. Now we can use Clairaut's Theorem to compactify the resulting expression a bit.

$$
	D_{\vec{u}}D_{\vec{u}} f &= c^2f_{xx} + 2cdf_{xy} + d^2f_{yy}.
$$

We're interested in plugging in the critical point $(a, b)$ and figuring out the sign of the resulting expression: if it's always positive, then we know this is a local minimum (there are some small extra details required here, but continuous second partial derivatives like we've assumed, this is enough). If it's always negative, then we know it's a local maximum. If it's sometimes one and sometimes the other, then it must be a saddle point, and otherwise, the single-variable second derivative test is inconclusive. With that in mind, let's plug in $(a, b)$ and see how to reason about the resulting formula.

We have

$$
	D_{\vec{u}}D_{\vec{u}} f(a, b) &= c^2f_{xx}(a, b) + 2cdf_{xy}(a, b) + d^2f_{yy}(a, b),
$$

and to keep it simple, let's write this as

$$
	Ac^2 + 2Bcd + Cd^2
$$

for

$$
	A &= f_{xx}(a, b)

	B &= f_{xy}(a, b)

	C &= f_{yy}(a, b).
$$

To summarize where we are, we're looking to analyze the sign of this polynomial over all possible values of $c$ and $d$. Thankfully for us, it's not that bad! Let's set $g(c) = Ac^2 + 2Bcd + Cd^2$, which is a quadratic in $c$ (and $d$, but let's just think of it in terms of one variable for now), and so its graph is a parabola, as long as $A \neq 0$. Let's assume that for now and put off the $A = 0$ case until later. Since $g$ is a polynomial, it's continuous, and so to determine its sign, we can just see when it's zero. The quadratic formula gives us

$$
	c &= \frac{-2Bd \pm \sqrt{4B^2d^2 - 4ACd^2}}{2A}

	&= \frac{-2Bd \pm 2|d|\sqrt{B^2 - AC}}{2A}

	&= \frac{-Bd \pm |d|\sqrt{B^2 - AC}}{A}.
$$

Now this only gives real-valued solutions for $c$ (i.e. solutions that are useful to us) when the expression under the root is nonnegative. If it's negative, then $g(c)$ is never zero, and so it *cannot change sign*. That means every cross-section of the graph of $f(x, y)$ through the point $(a, b)$ always has the same concavity --- either up or down --- no matter which direction of cross-section we pick.

Similarly, if the expression $B^2 - AC$ under the root is positive, then the graph of $g(c)$ crosses the $c$-axis in two different places. That means it *must* be sometimes positive and sometimes negative, so $(a, b)$ has to be a saddle point. If $B^2 - AC = 0$, then the graph of $g(c)$ touches the $c$-axis but doesn't cross it, and so the test is unfortunately inconclusive: all of the cross-sectional graphs through $(a, b)$ have the same concavity, except for one, whose second derivative at $(a, b)$ is zero, and our knowledge of single-variable calculus tells us that we can't say anything conclusive about that one.

Lastly, let's think through what happens if $A = 0$. As long as $C \neq 0$, we can repeat the same logic but treat $g$ as a function of $d$ to produce an identical result. If $C = 0$ too, then the equation is just

$$
	D_{\vec{u}}D_{\vec{u}} f(a, b) &= 2cdf_{xy}(a, b),
$$

and as long as $B = f_{xy}(a, b)$ is nonzero, there will *always* be values of $c$ and $d$ that make this sometimes positive and sometimes negative (whether $c$ and $d$ have the same or opposite signs). That agrees with our previous result, since $B^2 - AC = B^2$ will always be positive in this case. Finally, if $B = 0$ too, meaning all mixed partials are zero, then $D_{\vec{u}}D_{\vec{u}} f(a, b) = 0$ for any unit vector $\vec{u}$, and so we can't determine anything about concavity --- again, that agrees with the previous result, since $B^2 - AC = 0$.

That's a lot of information! One thing that's immediately clear is that the expression $B^2 - AC$ needs a name, and in fact it tells us almost everything we want to know. Luckily for us, that expression for a quadratic equation already has a name in math: it's called a **discriminant**. We also need to distinguish between a local maximum and local minimum once we know that a critical point is one of the two. We can do that by recognizing that in that case, all cross-sectional graphs have the same concavity (either positive or negative), and so we can just check one graph's concavity, say $f_{xx}(a, b)$. With all that said, let's state the second derivative test!

### thm -m "The second derivative test for a function of two variables"

	Let $f(x, y)$ be a differentiable function of two variables and whose second-order partial derivatives all exist and are continuous near a point $(a, b)$ where $\G f(a, b) = \vec{0}$ (we need the second condition so that we can apply Clairaut's Theorem). The **discriminant** of $f$ is

	$$
		D(x, y) = f_{xx}(x, y)f_{yy}(x, y) - f_{xy}(x, y)^2.
	$$

	If $D(a, b) > 0$ and either $f_{xx}(a, b) > 0$ or $f_{yy}(a, b) > 0$, then $f$ has a local minimum at $(a, b)$.

	If $D(a, b) > 0$ and either $f_{xx}(a, b) < 0$ or $f_{yy}(a, b) < 0$, then $f$ has a local maximum at $(a, b)$.

	If $D(a, b) < 0$, then $f$ has a saddle point at $(a, b)$.

	Otherwise, the test is inconclusive.

###

### ex

	Find and classify the critical points of $f(x, y) = x^3y + 9x^2 - 27y$.

	The gradient is

	$$
		\G f = \left< 3x^2y + 18x,\ x^3 - 27 \right>.
	$$

	The second component is zero when $x = 3$, so $27y + 54 = 0$, and so $y = -2$. That means the only critical point is $(3, -2)$, and now we can classify it. The second partial derivatives are

	$$
		f_{xx}(x, y) &= 6xy + 18

		f_{xy}(x, y) &= 3x^2

		f_{yy}(x, y) &= 0.
	$$

	At $(3, -2)$,

	$$
		f_{xx}(3, -2) &= -36 + 18 = -18

		f_{xy}(3, -2) &= 3(9) = 27

		f_{yy}(3, -2) &= 0

		D &= (-18)(0) - 27^2 = -729 < 0.
	$$

	Since the discriminant is negative, the point is a saddle point.

###

### exc "the second derivative test"

	Find and classify the critical points of $g(x, y) = x^3 - y^2 + 2xy$.

	### solution

	We'll start by finding the critical points, so we need the gradient.

	$$
		\G g = \left< 3x^2 + 2y, -2y + 2x \right>.
	$$

	This is equal to $\vec{0}$ when $x = y$ and $3x^2 + 2y = 0$, so

	$$
		3x^2 + 2x &= 0

		x\left( 3x + 2 \right) &= 0

		x &= 0, \quad x = -\frac{2}{3}.
	$$

	The critical points are then at $(0, 0)$ and $\left( -\frac{2}{3}, -\frac{2}{3} \right)$, and to classify them, we need the discriminant. Let's compute the second partials we need:

	$$
		g_{xx}(x, y) &= 6x

		g_{xy}(x, y) &= 2

		g_{yy}(x, y) &= -2

		~

		D(x, y) &= -12x - 4.
	$$

	So $D(0, 0) = -4 < 0$ and $D\left( -\frac{2}{3}, -\frac{2}{3} \right) = 4 > 0$, which tells us that $(0, 0)$ is a saddle point and $\left( -\frac{2}{3}, -\frac{2}{3} \right)$ is a local max, since $g_{yy}\left( -\frac{2}{3}, -\frac{2}{3} \right) = -2$ is negative. Not bad!

	### desmos secondDerivativeTest1

###

### exc "shortcomings of the second derivative test"

	Let $f$, $g$, and $h$ be the following functions:
	
	$$
		f(x, y) &= x^4 + y^4

		g(x, y) &= -x^4 - y^4

		h(x, y) &= x^4 - y^4
	$$

	1. Each of these functions has the same single critical point. What is it?
	
	2. What does the second derivative test say about that critical point for each of the three functions?

	3. For one of these functions, the critical point is a local maximum. For another, it's a local minimum, and for a third, it's a saddle point. Which is which? (Hint: think about the traces.)

	### solution

	1. Each functions has a gradient of

	$$
		\left< \pm 4x^3, \pm 4y^3 \right>,
	$$

	which is equal to $\vec{0}$ only at $(0, 0)$. That's the unique critical point for each of them.

	2. The second partial derivatives vary, but also only by a sign. For $f$,

	$$
		f_{xx}(x, y) &= 12x^2

		f_{xy}(x, y) &= 0

		f_{yy}(x, y) &= 12y^2

		D(0, 0) = 0.
	$$

	Similarly, $D(0, 0) = 0$ for both $g$ and $h$, so the second derivative test is inconclusive for all three functions.

	3. Much like $z = x^2 + y^2$, $f(x, y) = x^4 + y^4$ has a local minimum at $(0, 0)$, $g$ has a local maximum, and $h$ has a saddle point. The result here is that a discriminant of zero really doesn't tell us anything about the critical point!

	### desmos inconclusiveSecondDerivative

###

### exc "critical points and level curves"

	Suppose $f(x, y)$ has a critical point at $(0, 0)$ and $f(0, 0) = 2$.
	
	1. Suppose $f$ has a local min at $(0, 0)$. For values of $c$ close to $2$, what do the level curves $f(x, y) = c$ look like near $(0, 0)$?
	
	2. Now suppose $f$ has a local **max** at $(0, 0)$. Now what do the level curves $f(x, y) = c$ look like near $(0, 0)$?

	3. Finally, suppose $f$ has a saddle point at $(0, 0)$. How do the level curves change?

	4. (Bonus, if you have time) Are there any types of critical points that the previous cases don't cover? What would the level curves look like in that case?

###

Multivariable optimization has a habit of cropping up all over the place, just like single-variable optimization. Let's take a brief look at one of those places now.

### ex "linear regression"

	Suppose we have three points: $(1, 0)$, $(2, 3)$, and $(4, 3)$. Given a line $y = mx + b$, its **error** for the point $(p, q)$ is $\left| mp + b - q \right|$ (that is, the difference between the $y$-value the line predicts will be there and the actual $y$-value).

	While these three points don't lie in a line, we can still discuss the **best-fit** line to them: one that minimizes total error to all points. For both theoretical reasons slightly beyond our course and because the absolute value makes the error terms nondifferentiable, we typically try to minimize the sum of the *squares* of the error, rather than their sum outright.

	That total squared error is

	$$
		E &= \left| (m)(1) + b - 0 \right|^2 + \left| (m)(2) + b - 3 \right|^2 + \left| (m)(4) + b - 3 \right|^2

		&= \left( m + b - 0 \right)^2 + \left( 2m + b - 3 \right)^2 + \left( 4m + b - 3 \right)^2

		&= 21 m^2 + 14 b m + 3 b^2 - 36 m - 12 b + 18,
	$$

	and we can treat $E$ as a function $E(m, b)$: different lines produce different amounts of error. To minimize that error, we need to optimize $E$.

	$$
		\G E(m, b) = \left< 42m + 14b - 36, \quad 14m + 6b - 12 \right> = \vec{0}.
	$$

	Solving, $m = \frac{6}{7}$ and $b = 0$. The second derivative test tells us

	$$
		E_{mm}E_{bb} - E_{mb}^2 &= 42(6) - 14^2

		&= 56 > 0
	$$

	and $E_{mm} > 0$,

	so $\left( \frac{6}{7}, 0 \right)$ is a local minimum. In general, a function having a single local minimum is *not enough* to conclude that it's the global minimum in general (we'll discuss this in the next exercise), but since $E$ is a quadratic, we can confidently conclude that this critical point is indeed the global minimum.

	Visually, the line does a good job of approximating these points! Drag the red point around to see how the best-fit line changes.

	### desmos bestFitLine

	This process works for any number of points, and we can even do it symbolically for a set of points $\left\{ (x_i, y_i) \in #R#^2 \mid 1 \leq i \leq n \right\}$. If $\overline{x}$ and $\overline{y}$ are the averages of the $x_i$ and $y_i$, then

	$$
		m &= \frac{\sum_{i = 1}^n \left( x_i - \overline{x} \right)\left( y_i - \overline{y} \right)}{\sum_{i = 1}^n \left( x_i - \overline{x}\right)^2}

		b &= \overline{y} - m\overline{x}.
	$$

	If you're in any STEM field besides math, you'll encounter best-fit lines like this with remarkable frequency! The process of producing them is called **linear regression**, and it's a core tool of data science and statistics.

###

Let's dig in more to that example's remark about local and global extrema. Let $y = f(x)$ be a differentiable single-variable function defined on all of $#R#$, and suppose $f$ has a single critical point at $x = c$ that is a local maximum. Then $(c, f(c))$ must also be the global maximum; if it weren't, then there would be some point $x = x_0$ with $f(x_0) \geq f(c)$. Since $f$ is continuous, that means there is also a point $x = a$ with $f(a) = f(c)$, and then the Mean Value Theorem guarantees a point $b$ between $a$ and $c$ with $f'(a) = 0$, contradicting the hypothesis that $f$ had only one critical point.

### desmos meanValueTheorem

Here, the blue point is at the local max of $c = 1$, but the red point at the same $y$-value guarantees a critical point somewhere in between; here, the orange point. In effect, if a differentiable function has a local max, then having any part of its graph lie *above* that local max requires another critical point where the graph turns around. For a function of two variables, however, this isn't true!

### exc "functions of two variables and critical points"

	Let $f(x, y)$ be defined by

	$$
		f(x, y) = 3xe^y - x^3 - e^{3y}.
	$$

	1. Show that $f$ has only a single critical point at $(1, 0)$ and that it has a local maximum there.

	2. Show that despite this, $f(-3, 0) > f(1, 0)$.

	### solution

	1. Taking the partials,

	$$
		f_x(x, y) &= 3e^y - 3x^2 = 0

		f_y(x, y) &= 3xe^y - 3e^{3y} = 0.
	$$

	The first equation reduces to $x^2 = e^y$, and the second to $x = e^{2y}$. That means $e^{4y} = e^y$, so $4y = y$ and therefore $y = 0$. In all, $(1, 0)$ is our only critical point.

	To classify it, we find the second partials as usual:

	$$
		f_{xx}(x, y) &= -6x

		f_{xy}(x, y) &= 3e^y

		f_{yy}(x, y) &= -9e^{3y}

		D(1, 0) &= (-6)(-9) - 3^2 = 45 > 0.
	$$

	Since $f_{xx}(1, 0) = -6 < 0$, $f$ has a local maximum at $(1, 0)$.

	2. This is a direct calulation:
	
	$$
		f(1, 0) &= 3 - 1 - 1 = 1

		f(-3, 0) &= -9 - (-27) - 1 = 17.
	$$

###

To see what's happening here, let's look at the graph.

### desmos misleadingCriticalPoint

The local maximum is the blue point on the left, and the point higher than it is on the right. Here we can see that our single-variable logic fails in two places: first, while the Mean Value Theorem guarantees that the orange curve connecting the two points has a critical point somewhere in the middle, that does *not* imply a critical point of $f(x, y)$; only that $f_x$ is zero there. Second, while we might still feel a critical point must be lurking somewhere else, we can see that this function has found a way to hide it: while the partial derivatives *limit* to zero along the $y$-axis as $y \to -\infty$, they never actually reach zero. In effect, the extra room of a $2$-dimensional domain allows functions to push an additional critical point infinitely far away.

We've gone a long way toward bringing the second derivative test to functions of multiple variables! In the next section, we'll finish the job by finding an analogue to optimizing a function on a closed interval, and in the one after that, we'll conclude our discussion of multivariable calculus by considering more complicated constraints a function can have that bound its domain.

### nav-buttons