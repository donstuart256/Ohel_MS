from rest_framework import serializers
from .models import Book, LibraryMember, Borrowing

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'

class LibraryMemberSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    class Meta:
        model = LibraryMember
        fields = '__all__'

class BorrowingSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    member_name = serializers.CharField(source='member.user.get_full_name', read_only=True)
    class Meta:
        model = Borrowing
        fields = '__all__'
