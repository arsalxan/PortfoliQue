package com.portfolique;

import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest(properties = "spring.ai.openai.api-key=dummy-test-key")
class PortfoliQueBackendApplicationTests {

    @MockitoBean
    private ChatModel chatModel;

	@Test
	void contextLoads() {
	}

}
