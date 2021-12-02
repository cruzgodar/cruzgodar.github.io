// Formula from Louis Saalschütz according to Wikipedia.
float bernoulli(float m)
{
	if (m > 1.0 && mod(m, 2.0) != 0.0)
	{
		return 0.0;
	}
	
	float summer = 0.0;
	
	for (int v = 0; v < 1000; v++) 
	{
		if (float(v) > m) 
		{
			break;
		}
		
		for (int k = 0; k < 1000; k++) 
		{
			if (float(k) > m) 
			{
				break;
			}
			
			summer += (1.0 - 2.0 * mod(float(v), 2.0)) * binomial(float(k),float(v)) * pow(float(v),m) / (float(k)+1.0);
		}
	}
	
	return summer;
}