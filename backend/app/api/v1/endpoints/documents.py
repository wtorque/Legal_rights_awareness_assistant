from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import FileResponse, Response

from app.core.config import Settings, get_settings
from app.core.exceptions import ValidationFailed
from app.repositories.documents import DocumentRepository
from app.schemas.documents import (
    Category, CompareRequest, DocumentAnalysis, DocumentComparison, DocumentContent, DocumentRecord,
)
from app.services.documents import DocumentService

router = APIRouter(prefix="/documents", tags=["documents"])
_CHUNK = 64 * 1024


def get_document_service(settings: Settings = Depends(get_settings)) -> DocumentService:
    repo = DocumentRepository(settings.documents_dir)
    return DocumentService(repo, settings.max_upload_bytes)


@router.post("/upload", status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    category: Category = Form("other"),
    service: DocumentService = Depends(get_document_service),
    settings: Settings = Depends(get_settings),
) -> DocumentRecord:
    """Multipart upload. The size limit is enforced while reading, not only by Content-Length."""
    data = bytearray()
    while chunk := await file.read(_CHUNK):
        data.extend(chunk)
        if len(data) > settings.max_upload_bytes:
            raise ValidationFailed(f"That file is larger than {settings.max_upload_bytes // (1024 * 1024)} MB")
    return await service.upload(name=file.filename, data=bytes(data), category=category)


@router.get("")
async def list_documents(service: DocumentService = Depends(get_document_service)) -> list[DocumentRecord]:
    return await service.list()


@router.post("/compare")
async def compare_documents(body: CompareRequest, service: DocumentService = Depends(get_document_service)) -> DocumentComparison:
    return await service.compare(body.left_id, body.right_id)


@router.get("/{document_id}")
async def get_document(document_id: str, service: DocumentService = Depends(get_document_service)) -> DocumentRecord:
    return await service.get(document_id)


@router.get("/{document_id}/content")
async def get_content(document_id: str, service: DocumentService = Depends(get_document_service)) -> DocumentContent:
    return await service.content(document_id)


@router.get("/{document_id}/file")
async def get_file(document_id: str, service: DocumentService = Depends(get_document_service)) -> FileResponse:
    path = await service.pdf_path(document_id)
    # Served as an attachment-safe PDF: sandboxed so nothing inside can run in the API origin.
    return FileResponse(path, media_type="application/pdf", headers={
        "Content-Disposition": "inline; filename=document.pdf",
        "Content-Security-Policy": "sandbox",
    })


@router.post("/{document_id}/analysis")
async def analyze_document(document_id: str, service: DocumentService = Depends(get_document_service)) -> DocumentAnalysis:
    return await service.analysis(document_id)


@router.delete("/{document_id}", status_code=204)
async def delete_document(document_id: str, service: DocumentService = Depends(get_document_service)) -> Response:
    await service.delete(document_id)
    return Response(status_code=204)
