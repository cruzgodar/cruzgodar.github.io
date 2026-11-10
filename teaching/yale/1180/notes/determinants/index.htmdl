### nav-buttons



Our final topic in linear algebra will provide the last large missing piece in the story of matrices and linear transformations. For a generic transformation $T : #R#^n \to #R#^m$, most of that story is already told: the matrix of a transformation completely describes how it operates on vectors, and the number of linearly independent columns in that matrix tells us if it's one-to-one and/or onto. In the particular case when $n = m$ (so the domain and codomain are equal), we have the possibility of the matrix (and therefore transformation) being invertible. But there's a loose thread there that we haven't quite pulled yet, and it will turn out to be quite a long thread indeed: when $T : #R#^n \to #R#^n$, $T(\vec{v})$ is exactly the same shape as $\vec{v}$, and so the two can be directly compared to one another.

### def "linear operator"

	A **linear operator** is a linear transformation whose domain and codomain are equal --- that is, it's an operator whose matrix is square.

###

### def "matrix minor"

	Let $A$ be an $m \times n$ matrix. The **minor** of $A$ corresponding to row $i$ and column $j$ is the $(m - 1) \times (n - 1)$ matrix obtained by crossing out row $i$ and column $j$ from $A$.

###

### ex "matrix minor"

	Find the minors of $$[[ 1, 4, 9 ; 2, 1, 6 ; -3, -1, 0 ]]$$ corresponding to each entry in the first row.

	### solution

	By crossing out the appropriate rows and columns, we get

	$$
		[[ , ,  ; , 1, 6 ; , -1, 0 ]] \qquad [[ , ,  ; 2, , 6 ; -3, , 0 ]] \qquad [[ , ,  ; 2, 1,  ; -3, -1,  ]],
	$$

	for the entries in row $1$ and columns $1$, $2$, and $3$, respectively, which are just the $2 \times 2$ matrices

	$$
		[[ 1, 6 ; -1, 0 ]] \qquad [[ 2, 6 ; -3, 0 ]] \qquad [[ 2, 1 ; -3, -1 ]].
	$$

###

With minors defined, we can finally get to the main definition of the section.

### def "determinant"

	Let $A$ be an $n \times n$ matrix. The **determinant** of $A$, written $\det A$, is a single number that we compute recursively. If $n = 1$, then $\det A$ is just its single entry --- e.g. $\det [[5]] = 5$. For $n > 1$, choose any row or column of $A$ and call it $\vec{v}$, and find the minors of $A$ for every entry in $\vec{v}$, denoting them $A_1, A_2, ..., A_n$. Then find the determinant of each $A_i$ and add up the quantities $\vec{v}_i \det A_i$ with alternating signs given by the checkerboard-like matrix

	$$
		[[ +, -, +, -, \cdots ; -, +, -, +, \cdots ; +, -, +, -, \cdots ; -, +, -, +, \cdots ; \vdots, \vdots, \vdots, \vdots, \ddots ]].
	$$

###

Let's be clear: this is a ridiculous definition, and it seems like shouldn't have any use at all. Even the language used to describe it is a bit clunky, and we need to work through some examples to see how to compute it at all. It's one of the most surprising facts in the course that not only is the determinant useful, but it will continue to show up in seemingly unrelated topics.

### ex "the determinant"

	Compute $$\det [[ 1, 4 ; 2, 5 ]]$$.

	### solution

	Let's expand about the first row. We take each entry in the row and multiply it by the determinant of its minor, then add a sign according to that checkerboard sign matrix. Here, that's

	$$
		1 \cdot \det [[ 5 ]] - 4 \cdot \det [[ 2 ]] = 5 - 8 = -3.
	$$

	In fact, this process is nearly identical for a generic $2 \times 2$ matrix:

	$$
		\det [[ a, b ; c, d ]] &= a \cdot \det [[ d ]] - b \cdot \det [[ c ]]

		&= ad - bc.
	$$

	This a useful formula that lets us nearly instantly calculate $2 \times 2$ determinants, and we've also seen this expression before --- it's the denominator in the generic $2 \times 2$ matrix inverse formula. This is our first clue that the determinant is more than just some random number, and it will be far from the last.

###

### exc "the determinant"

	1. Compute $$\det [[ 1, 2, 3 ; 4, 0, 6 ; 7, 9, 0 ]]$$.

	2. An implicit assertion in the definition of the determinant is that its value is the same no matter which row or column we expand about. For the generic $2 \times 2$ matrix $[[ a, b ; c, d ]]$, expand about both rows and both columns and show that the result is always $ad - bc$.

	### solution

	1. There are many ways to go about this, but in general, it's easiest to pick rows or columns with as many zeros as possible. If we choose row 2, for instance, then

	$$
		\det [[ 1, 2, 3 ; 4, 0, 6 ; 7, 9, 0 ]] &= -4\det [[ 2, 3 ; 9, 0 ]] -6\det [[ 1, 2 ; 7, 9 ]]

		&= -4(2\cdot0 - 3\cdot9) -6\det (1\cdot9-2\cdot7)

		&= 108 + 30 = 138
	$$

###

In general, it's easiest to choose the row or columns containing the most zeros, since then we have the fewest smaller determinants to compute.

### ex "the determinant"

	Compute $$\det [[ 1, 4, 7, 2 ; 0, 4, 5, 0 ; 3, 1, 2, 0 ; 1, 2, 3, 4 ]]$$.

	### solution

	The second row has the most zeros, so let's expand about that, ignoring the zero entries. Since we're in the second row, the signs will start negative in the sum --- so the $4$'s term is positive and the $5$'s term negative. We have

	$$
		4\det [[ 1, 7, 2 ; 3, 2, 0 ; 1, 3, 4 ]] -5\det [[ 1, 4, 2 ; 3, 1, 0 ; 1, 2, 4 ]],
	$$

	and we can expand both of those about row 2 to get

	$$
		4\left( -3\det [[ 7, 2 ; 3, 4 ]] + 2\det [[ 1, 2 ; 1, 4 ]] \right) - 5 \left( -3 \det [[ 4, 2 ; 2, 4 ]] + \det [[ 1, 2 ; 1, 4 ]] \right).
	$$

	Now we can use the $2 \times 2$ determinant formula we just found to turn this into

	$$
		4( -3(28 - 6) + 2(4 - 2) ) - 5 ( -3(16 - 4) + (4 - 2) ) = -78.
	$$

###

### exc "the determinant"

	Compute $$\det [[ 1, -6, 5, 3 ; 0, 4, 2, -1 ; 0, 0, 9, 9 ; 0, 0, 0, -3 ]]$$.

	### solution

	We can begin by expanding about the first column, then the second, and then the third:

	$$
		\det [[ 1, -6, 5, 3 ; 0, 4, 2, -1 ; 0, 0, 9, 9 ; 0, 0, 0, -3 ]] &= 1\det [[ 4, 2, -1 ; 0, 9, 9 ; 0, 0, -3 ]]

		&= 4\det [[ 9, 9 ; 0, -3 ]]

		&= 4(-27)

		&= -108.
	$$

###

Now we can begin to connect determinants to the other topics we've learned; we'll start with invertibility. The result is what we might predict from the generic $2 \times 2$ inverse formula: there, the matrix was invertible exactly when $ad - bc \neq 0$, and the general result is a direct extension.

### thm "determinants and invertibility"

	Let $A$ be an $n \times n$ matrix. Then $A$ is invertible exactly when $\det A \neq 0$.

###

Since invertibility is equivalent to being one-to-one or onto for square matrices, we now have a fourth equivalent condition. With the next definition and result, we'll have even more.

### def "transpose"

	Let $A$ be a matrix. The **transpose** of $A$ is the matrix $A^T$ formed by writing the rows of $A$ as columns, and vice versa, in a new matrix --- i.e. flipping $A$ across its diagonal.

###

We've seen the transpose indirectly in the last section --- it's the matrix we row reduce to find how many columns are linearly independent. For example,

$$
	[[ 1, 4, 5 ; -4, 2, 0 ]]^T = [[ 1, -4 ; 4, 2 ; 5, 0 ]].
$$

Transposing a matrix is an operation substantially more complicated than any row operation, it's out of the scope of our class to understand its effect from a linear transformation perspective. But we can relate it to the determinant: when we expand a square matrix $A$ about a row to find its determinant, we can expand $A^T$ about that column, and vice versa, to get exactly the same result. Therefore,

### prop "determinants and transposes"

	Let $A$ be an $n \times n$ matrix. Then $\det A^T = \det A$.

###

This result means $A^T$ is invertible exactly when $A$ is, and the columns of $A^T$ are the rows of $A$, so we can add a few more items to our ever-growing list of equivalent conditions for a square matrix.

### prop "invertibility conditions"

	Let $A$ be an $n \times n$ matrix with corresponding linear transformation $T$. Then the following are equivalent:

	1. $T$ is an invertible function.

	2. $A$ is an invertible matrix.

	3. $A$ row reduces to the identity matrix.

	4. $T$ is one-to-one.

	5. The columns of $A$ are linearly independent.

	6. The rows of $A$ are linearly independent.

	7. $T$ is onto.

	8. The columns of $A$ span $#R#^n$.

	9. The rows of $A$ span $#R#^n$.

	10. $\det A \neq 0$.

	11. $\det A^T \neq 0$.

###

The determinant also interacts nicely with matrix multiplication: it's a multiplicative function.

### thm "the determinant is multiplicative"

	Let $A$ and $B$ be $n \times n$ matrices. Then $\det (AB) = (\det A) (\det B).$

###

We'll have more to say about the transpose and multiplicativity of the determinant on the homework, but for now, let's look at one final connection with prior material: an interpretation in the language of linear transformations.

### thm "the determinant as a scaling factor"

	Let $T : #R#^n \to #R#^n$ be a linear operator with matrix $A$, and let $X$ be a volume in $#R#^n$ of dimension $n$ (e.g. a $2$-dimensional subset of $#R#^2$ or a $3$-dimensional subset of $#R#^3$). Then the volume of $T(X)$ (the image of $X$) is $|\det A|$ times the volume of $X$.

###

This result needs some examples to explain it, so let's start there.

### ex "the determinant as a scaling factor"

	Let $T : #R#^2 \to #R#^2$ be defined by

	$$
		T\left( [[ x ; y ]] \right) = [[ x + y ; 3x - 2y ]].
	$$

	Let $X$ is the solid circle of radius $1$ centered at $(0, 2)$. Describe $T(X)$ and find its area.

	### solution

	First of all, the matrix for $T$ is

	$$
		A = [[ 1, 1 ; 3, -2 ]],
	$$

	and its determinant is $\det A = -5$. The boundary circle of $X$ is given by the points $x = \cos(\theta)$ and $y = \sin(\theta) + 2$ for any value of $\theta$, so the boundary of $T(X)$ is given by 

	$$
		x &= \cos(\theta) + \sin(\theta) + 2

		y &= 3\cos(\theta) - 2(\sin(\theta) + 2)
	$$

	obtained by replacing $x$ and $y$ with their images under $T$. Geometrically, $T(X)$ is an ellipse:

	### desmos determinantScaling

	The area of that ellipse doesn't look pleasant to compute, but since it's the image of the circle under $T$, its area is just the area of the circle times the magnitude of the determinant (i.e. $5$). Since the circle's area is $\pi(1^2) = \pi$, the ellipse has area $5\pi$.

###

### exc "the determinant as a scaling factor"

	Let $S : #R#^3 \to #R#^3$ be defined by

	$$
		S\left( [[ x ; y ; z ]] \right) = [[ 2x + y ; x + 3y + z ; 2x + y + 3z ]].
	$$

	The unit cube in $#R#^3$ is the set of points $(x, y, z)$ with $0 \leq x \leq 1$, $0 \leq y \leq 1$, and $0 \leq z \leq 1$, and is defined by its three bounding vectors

	$$
		[[ 1 ; 0 ; 0 ]], \quad [[ 0 ; 1 ; 0 ]], \quad [[ 0 ; 0 ; 1 ]].
	$$

	Find the image of the unit cube under $S$ by finding the images of those three vectors and sketch a picture of it, and then find its volume.

	### solution

	The images of these three vectors are the columns of the matrix for $S$:

	$$
		[[ 2 ; 1 ; 2 ]], \quad [[ 1 ; 3 ; 1 ]], \quad [[ 0 ; 1 ; 3 ]].
	$$

	Drawing these as a shape in $#R#^3$ looks like a 3D parallelogram (the proper term is **parallelepiped**).

	### desmos parallelepiped

	Since the determinant of the matrix for $S$ is $6$ and the volume of the original cube was $1$, this new volume is $6 \cdot 1 = 6$.

###



### nav-buttons