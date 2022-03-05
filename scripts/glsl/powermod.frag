// modular exponentiation
// returns a^b mod c
int powermod(int a, int b, int c) {
	if (c==0) {
		return 0;
	}
	int temp = 1;
	float floatc = float(c);
	for (int i = 0; i < 1000; i++) {
		if (i == b) {
			return temp;
		}
		temp *= a;
		temp = int(mod(float(temp),floatc));
	}
	return temp;
}