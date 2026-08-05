package com.ecommerce.buyme.service.chroma;

import java.util.ArrayList;
import java.util.List;

import org.springframework.ai.chroma.vectorstore.ChromaApi;
import org.springframework.ai.chroma.vectorstore.ChromaApi.Collection;
import org.springframework.ai.chroma.vectorstore.ChromaApi.CreateCollectionRequest;
import org.springframework.ai.chroma.vectorstore.ChromaApi.DeleteEmbeddingsRequest;
import org.springframework.ai.chroma.vectorstore.ChromaApi.GetEmbeddingResponse;
import org.springframework.ai.chroma.vectorstore.ChromaApi.GetEmbeddingsRequest;
import org.springframework.ai.chroma.vectorstore.ChromaApi.QueryRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.ecommerce.buyme.exceptions.ChromaOperationException;
import com.ecommerce.buyme.request.EmbeddingsDeleteRequest;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChromaService implements IChromaService {
    private final  ChromaApi chromaApi;

    @Value("${spring.ai.vectorstore.chroma.tenant-name}")
    private String tenantName;
    @Value("${spring.ai.vectorstore.chroma.database-name}")
    private String databaseName;

    @Override
    public void deleteCollection(String collectionName) {
        try {
            chromaApi.deleteCollection(tenantName, databaseName, collectionName);
        } catch (ChromaOperationException e) {
            throw e;
        } catch (Exception e) {
            throw new ChromaOperationException("Failed to delete collection: " + collectionName, e);
        }
    }

    @Override
    public List<Collection> getAllCollections() {
        try {
            return chromaApi.listCollections(tenantName, databaseName);
        } catch (ChromaOperationException e) {
            throw e;
        } catch (Exception e) {
            throw new ChromaOperationException("Failed to retrieve collections", e);
        }
    }

    @Override
    public GetEmbeddingResponse getEmbeddings(String collectionId) {
        try {
            GetEmbeddingsRequest request = new GetEmbeddingsRequest(
                null,
                null,
                4,
                0,
                QueryRequest.Include.all
            );
            
            return chromaApi.getEmbeddings(tenantName, databaseName, collectionId, request);
        } catch (ChromaOperationException e) {
            throw e;
        } catch (Exception e) {
            throw new ChromaOperationException("Failed to get embedding for collection: " + collectionId, e);
        }
    }

    @Override
    public Collection createCollection(String collectionName) {
        try {
            CreateCollectionRequest request = new CreateCollectionRequest(collectionName);
            return  chromaApi.createCollection(tenantName, databaseName, request);
        } catch (ChromaOperationException e) {
            throw e;
        } catch (Exception e) {
            throw new ChromaOperationException("Failed to create collection: " + collectionName, e);
        }
    }   

    @Override
    public Collection getCollectionByName(String collectionName) {
        try {
            return chromaApi.getCollection(tenantName, databaseName, collectionName);
        } catch (ChromaOperationException e) {
            throw e;
        } catch (Exception e) {
            throw new ChromaOperationException("Failed to retrieve collection by name: " + collectionName, e);
        }
    }

    @Override
    public void deleteEmbeddingByCollectionId(EmbeddingsDeleteRequest request) {
        try {
            log.info("deleting embeddings for imageId={} in collectionId={}", request.getImageId(), request.getCollectionId());
            String collectionId = request.getCollectionId();
            List<String> idsToDelete = findIdsToDelete(collectionId, request.getImageId());
            if(idsToDelete.isEmpty()) {
                log.warn("No embeddings found for imageId={}", request.getImageId());
                return;
            }
            performDelete(collectionId, idsToDelete, Long.valueOf(request.getImageId()));

        } catch (ChromaOperationException e) {
            throw e;
        } catch (Exception e) {
            throw new ChromaOperationException("Failed to delete embeddings for collection", e);
        }
    }

    private void performDelete(String collectionId, List<String> idsToDelete, Long imageId) {
        try {
            DeleteEmbeddingsRequest deleteRequest = new DeleteEmbeddingsRequest(idsToDelete, null);
            log.info("sending delete request={}", deleteRequest);
            
            var deleteResponse = chromaApi.deleteEmbeddings(tenantName, databaseName, collectionId, deleteRequest);
            log.info("delete response={}", deleteResponse);
        } catch (ChromaOperationException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to delete embeddings for imageId={} in idsToDelete={}", imageId, idsToDelete, e);
            throw new ChromaOperationException("Failed to delete embeddings for imageId=" + imageId, e);
        }
    }

    private List<String> findIdsToDelete(String collectionId, String imageId) {
        List<String> idsToDelete = new ArrayList<>();
        GetEmbeddingResponse embeddingsResponse = fetchEmbeddingsByImageId(collectionId, imageId);
        if(embeddingsResponse != null && !embeddingsResponse.ids().isEmpty()) {
            idsToDelete.addAll(embeddingsResponse.ids());
            log.info("found embeddings by id={}", embeddingsResponse.ids());
        }

        return idsToDelete;
    }

    private GetEmbeddingResponse fetchEmbeddingsByImageId(String collectionId, String imageId) {
        try {
            GetEmbeddingsRequest request = new GetEmbeddingsRequest(
                List.of(imageId),
                null,
                100,
                0,
                QueryRequest.Include.all
            );
            return chromaApi.getEmbeddings(tenantName, databaseName, collectionId, request);
        } catch (ChromaOperationException e) {
            throw e;
        } catch (Exception e) {
            throw new ChromaOperationException("Failed to fetch embeddings for imageId: " + imageId, e);
        }
    }

}
