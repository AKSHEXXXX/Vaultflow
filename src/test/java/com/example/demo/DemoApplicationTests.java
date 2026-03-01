package com.example.demo;

import com.demoapplication.saas.SaaSApplication;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(classes = SaaSApplication.class)
@ActiveProfiles("dev")
class DemoApplicationTests {

	@Test
	void contextLoads() {
	}

}
