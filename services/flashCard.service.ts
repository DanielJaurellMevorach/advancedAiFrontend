const getAllFlashCardsByUserId = async (userId: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/flashcards/user/${userId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch flashcards");
  }
  return response.json();
};

const flashCardService = {
  getAllFlashCardsByUserId,
};
export default flashCardService;
