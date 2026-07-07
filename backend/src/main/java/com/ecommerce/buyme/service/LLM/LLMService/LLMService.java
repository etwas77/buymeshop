package com.ecommerce.buyme.service.LLM.LLMService;

import java.io.ByteArrayInputStream;
import java.io.IOException;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeType;

import com.ecommerce.buyme.dtos.ImageEmbeddingPayload;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class LLMService
{
    private final ChatModel chatModel;
    
    public String describeImage(ImageEmbeddingPayload payload) throws IOException {
        String mimeType = payload.contentType();
        if (mimeType == null || !mimeType.startsWith("image/")) {
            throw new IllegalArgumentException("Unsupported or missing image MIME type");
        }
        InputStreamResource resource =
            new InputStreamResource(new ByteArrayInputStream(payload.imageBytes()));
        
        return ChatClient.create(chatModel)
        .prompt()
        .user(promptUserSpec -> promptUserSpec.text(
            """
            Generate a concise, detailed textual description of the image strictly for visual similarity search.
            Follow these rules:
            - Limit the description to 2-3 short sentences or a list of key attributes.
            - Focus ONLY on clearly visible, distinctive features such as:
                * Color, shape, size, patterns, textures, and any unique markings.
                * Specific objects, elements, or subjects present in the image.
                * Brand names or logos if they are clearly visible.
                * Scene context or environment if it is relevant and clearly depicted.
            - Do NOT include subjective opinions, guesses, or generic terms like "product", "item", "electronic device", "communication device", etc.
            - Avoid filler words or vague language.
            - Use simple direct language suitable for automated similarity matching algorithms.
            Provide the description in a single paragraph without any additional commentary or formatting.
            """
        ).media(MimeType.valueOf(mimeType), resource))
        .call()
        .content();
        
    }
}
