from rest_framework import viewsets
from .models import Book, LibraryMember, Borrowing
from .serializers import BookSerializer, LibraryMemberSerializer, BorrowingSerializer

from rest_framework import viewsets, filters

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'author', 'isbn']

class LibraryMemberViewSet(viewsets.ModelViewSet):
    queryset = LibraryMember.objects.all()
    serializer_class = LibraryMemberSerializer

from rest_framework.response import Response
from rest_framework import status

class BorrowingViewSet(viewsets.ModelViewSet):
    queryset = Borrowing.objects.all()
    serializer_class = BorrowingSerializer
    filterset_fields = ['member', 'book', 'return_date']

    def perform_create(self, serializer):
        book = serializer.validated_data['book']
        if book.available_quantity < 1:
            raise serializers.ValidationError({"book": "This book is currently out of stock."})
        book.available_quantity -= 1
        book.save()
        serializer.save()

    def perform_update(self, serializer):
        instance = self.get_object()
        updated_instance = serializer.save()
        # If it was returned
        if not instance.return_date and updated_instance.return_date:
            book = updated_instance.book
            book.available_quantity += 1
            book.save()
