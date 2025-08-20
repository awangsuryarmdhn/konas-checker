export default async function handler(req, res) {
  return res.status(200).json({
    success: false,
    message: "Fitur upload ke Web3.Storage dinonaktifkan sementara."
  });
}
