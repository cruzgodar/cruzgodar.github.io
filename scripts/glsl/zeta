// Riemann zeta function
// algorithm 2 of http://citeseerx.ist.psu.edu/viewdoc/download;jsessionid=5B07751C858FF584B31B250A0F3AFC58?doi=10.1.1.56.9455&rep=rep1&type=pdf
// accurate for |a|<20 or so
#function zeta zeta_helper functional_zeta functional_zeta_helper
#requires cpow_logz cexp cpow
vec2 zeta_helper(vec2 a) {

	vec2 tot = -ONE;
	vec2 minus_a = -a;
	tot += 1.00000000000000 * cpow_logz(2.0, 0.693147180559945, minus_a);
	tot += -1.00000000000000 * cpow_logz(3.0, 1.09861228866811, minus_a);
	tot += 0.999999999999999 * cpow_logz(4.0, 1.38629436111989, minus_a);
	tot += -0.999999999999910 * cpow_logz(5.0, 1.60943791243410, minus_a);
	tot += 0.999999999996429 * cpow_logz(6.0, 1.79175946922805, minus_a);
	tot += -0.999999999904138 * cpow_logz(7.0, 1.94591014905531, minus_a);
	tot += 0.999999998151620 * cpow_logz(8.0, 2.07944154167984, minus_a);
	tot += -0.999999973295076 * cpow_logz(9.0, 2.19722457733622, minus_a);
	tot += 0.999999701660162 * cpow_logz(10.0, 2.30258509299405, minus_a);
	tot += -0.999997359881274 * cpow_logz(11.0, 2.39789527279837, minus_a);
	tot += 0.999981139767760 * cpow_logz(12.0, 2.48490664978800, minus_a);
	tot += -0.999889578402344 * cpow_logz(13.0, 2.56494935746154, minus_a);
	tot += 0.999463606757703 * cpow_logz(14.0, 2.63905732961526, minus_a);
	tot += -0.997816065634779 * cpow_logz(15.0, 2.70805020110221, minus_a);
	tot += 0.992483334827706 * cpow_logz(16.0, 2.77258872223978, minus_a);
	tot += -0.977968845735875 * cpow_logz(17.0, 2.83321334405622, minus_a);
	tot += 0.944645027642685 * cpow_logz(18.0, 2.89037175789616, minus_a);
	tot += -0.880007399531768 * cpow_logz(19.0, 2.94443897916644, minus_a);
	tot += 0.774086279213452 * cpow_logz(20.0, 2.99573227355399, minus_a);
	tot += -0.627697859081215 * cpow_logz(21.0, 3.04452243772342, minus_a);
	tot += 0.457676465199407 * cpow_logz(22.0, 3.09104245335832, minus_a);
	tot += -0.292687417013889 * cpow_logz(23.0, 3.13549421592915, minus_a);
	tot += 0.160058539631908 * cpow_logz(24.0, 3.17805383034795, minus_a);
	tot += -0.0728150759639730 * cpow_logz(25.0, 3.21887582486820, minus_a);
	tot += 0.0266650641624859 * cpow_logz(26.0, 3.25809653802148, minus_a);
	tot += -0.00752290240470469 * cpow_logz(27.0, 3.29583686600433, minus_a);
	tot += 0.00153010822756563 * cpow_logz(28.0, 3.33220451017520, minus_a);
	tot += -0.000199240949265922 * cpow_logz(29.0, 3.36729582998647, minus_a);
	tot += 0.0000124525593291201 * cpow_logz(30.0, 3.40119738166216, minus_a);
	return cdiv(-tot, (ONE-cpow_logz(2.0,0.693147180559945, ONE-a)));
}

vec2 functional_zeta_helper(vec2 a) {

	vec2 tot = -ONE;
	vec2 minus_a = -a;
	tot += 1.00000000000000 * cpow_logz(2.0, 0.693147180559945, minus_a);
	tot += -1.00000000000000 * cpow_logz(3.0, 1.09861228866811, minus_a);
	tot += 0.999999999999999 * cpow_logz(4.0, 1.38629436111989, minus_a);
	tot += -0.999999999999910 * cpow_logz(5.0, 1.60943791243410, minus_a);
	tot += 0.999999999996429 * cpow_logz(6.0, 1.79175946922805, minus_a);
	tot += -0.999999999904138 * cpow_logz(7.0, 1.94591014905531, minus_a);
	tot += 0.999999998151620 * cpow_logz(8.0, 2.07944154167984, minus_a);
	tot += -0.999999973295076 * cpow_logz(9.0, 2.19722457733622, minus_a);
	tot += 0.999999701660162 * cpow_logz(10.0, 2.30258509299405, minus_a);
	tot += -0.999997359881274 * cpow_logz(11.0, 2.39789527279837, minus_a);
	tot += 0.999981139767760 * cpow_logz(12.0, 2.48490664978800, minus_a);
	tot += -0.999889578402344 * cpow_logz(13.0, 2.56494935746154, minus_a);
	tot += 0.999463606757703 * cpow_logz(14.0, 2.63905732961526, minus_a);
	tot += -0.997816065634779 * cpow_logz(15.0, 2.70805020110221, minus_a);
	tot += 0.992483334827706 * cpow_logz(16.0, 2.77258872223978, minus_a);
	tot += -0.977968845735875 * cpow_logz(17.0, 2.83321334405622, minus_a);
	tot += 0.944645027642685 * cpow_logz(18.0, 2.89037175789616, minus_a);
	tot += -0.880007399531768 * cpow_logz(19.0, 2.94443897916644, minus_a);
	tot += 0.774086279213452 * cpow_logz(20.0, 2.99573227355399, minus_a);
	tot += -0.627697859081215 * cpow_logz(21.0, 3.04452243772342, minus_a);
	tot += 0.457676465199407 * cpow_logz(22.0, 3.09104245335832, minus_a);
	tot += -0.292687417013889 * cpow_logz(23.0, 3.13549421592915, minus_a);
	tot += 0.160058539631908 * cpow_logz(24.0, 3.17805383034795, minus_a);
	tot += -0.0728150759639730 * cpow_logz(25.0, 3.21887582486820, minus_a);
	tot += 0.0266650641624859 * cpow_logz(26.0, 3.25809653802148, minus_a);
	tot += -0.00752290240470469 * cpow_logz(27.0, 3.29583686600433, minus_a);
	tot += 0.00153010822756563 * cpow_logz(28.0, 3.33220451017520, minus_a);
	tot += -0.000199240949265922 * cpow_logz(29.0, 3.36729582998647, minus_a);
	tot += 0.0000124525593291201 * cpow_logz(30.0, 3.40119738166216, minus_a);
	return -tot;
}
// Specialized method for zeta to compute PI * sin(pi/2 z) gamma(1-z)
// When called, can assume re(z)<0.5
// so re(1-z) >= 0.5
vec2 functional_zeta(vec2 z) {
	vec2 a = -z;
	vec2 t = vec2(a.x + 7.5, a.y);

	vec2 y = GAMMA_CONST_0;
	y += cdiv(GAMMA_CONST_1, vec2(a.x + 1.0, a.y));
	y += cdiv(GAMMA_CONST_2, vec2(a.x + 2.0, a.y));
	y += cdiv(GAMMA_CONST_3, vec2(a.x + 3.0, a.y));
	y += cdiv(GAMMA_CONST_4, vec2(a.x + 4.0, a.y));
	y += cdiv(GAMMA_CONST_5, vec2(a.x + 5.0, a.y));
	y += cdiv(GAMMA_CONST_6, vec2(a.x + 6.0, a.y));
	y += cdiv(GAMMA_CONST_7, vec2(a.x + 7.0, a.y));
	y += cdiv(GAMMA_CONST_8, vec2(a.x + 8.0, a.y));
	// y is relatively small on critical strip

	// e^(-7.5)/sqrt(2 pi) = 0.000220648739881166806538...
	vec2 ans = 0.000220648739881166806538 * cpow_logz(PI*2.718281828459,2.144729885849,z);
	ans = cdiv(ans, cpow_logz(2.0, 0.693147180559945,a)-ONE);
	ans = cmul(ans,cexp(PI/2.0 * vec2(z.y,-z.x))-cexp(PI/2.0 * vec2(-z.y,z.x)));
	ans = vec2(-ans.y,ans.x);
	ans = cmul(ans,y);
	ans = cmul(ans,cpow(t,vec2(0.5-z.x,-z.y)));

	return ans;
}



// Seems to be pretty unstable with large imaginary part
vec2 zeta(vec2 a) {
	if (a.x < 0.5) {
		// this is the part that breaks down... can improve numerical stability of sin * gamma
		vec2 ans = cmul(functional_zeta(a), functional_zeta_helper(ONE-a));
		return vec2(ans.x,ans.y);
	} else {
		return zeta_helper(a);
	}
}

float zeta(float a) {
	return zeta(vec2(a,0.0)).x;
}
#endfunction