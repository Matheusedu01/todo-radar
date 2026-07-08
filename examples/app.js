// TODO: adicionar validação de entrada aqui
function calcularTotal(itens) {
  // FIXME: não está somando o frete corretamente
  return itens.reduce((soma, item) => soma + item.preco, 0);
}

// HACK: gambiarra temporária até a API v2 ficar pronta
function buscarUsuario(id) {
  return fetch(`/api/v1/users/${id}`);
}
