package com.ecommerce.buyme.service.chroma;

import java.util.List;

import org.springframework.ai.chroma.vectorstore.ChromaApi.Collection;
import org.springframework.ai.chroma.vectorstore.ChromaApi.GetEmbeddingResponse;

import com.ecommerce.buyme.request.EmbeddingsDeleteRequest;

public interface IChromaService {
    Collection createCollection(String collectionName);

    void deleteCollection(String collectionName);
    List<Collection> getAllCollections();
    GetEmbeddingResponse getEmbeddings(String collectionId);

    Collection getCollectionByName(String collectionName);

    void deleteEmbeddingByCollectionId(EmbeddingsDeleteRequest request);
}
